import os
import re

frontend_dir = 'frontend/src'
backend_dir = 'backend/src/main/java/com/startuphub/backend/controller'

# Extract frontend API calls
frontend_apis = set()
for root, _, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                content = f.read()
                # match template literals like `/api/v1/workspaces/${id}`
                matches_tpl = re.findall(r"apiClient\.(?:get|post|put|delete|patch)\(`(.*?)`", content)
                for match in matches_tpl:
                    # replace ${...} with a generic {param} for comparison
                    clean = re.sub(r'\$\{.*?\}', '{param}', match)
                    if clean.startswith('/'):
                        clean = '/api/v1' + clean
                    frontend_apis.add(clean)
                
                # matches apiClient.get('/auth/me')
                matches = re.findall(r"apiClient\.(?:get|post|put|delete|patch)\((['\"])(.*?)\1", content)
                for match in matches:
                    clean = match[1]
                    if clean.startswith('/'):
                        clean = '/api/v1' + clean
                    frontend_apis.add(clean)

print(f"Found {len(frontend_apis)} frontend API calls.")

# Extract backend endpoints
backend_endpoints = []
for root, _, files in os.walk(backend_dir):
    for file in files:
        if file.endswith('.java'):
            with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                content = f.read()
                
                # find class-level @RequestMapping
                base_path = ""
                class_mapping = re.search(r'@RequestMapping\((?:value\s*=\s*)?["\'](.*?)["\']\)', content)
                if class_mapping:
                    base_path = class_mapping.group(1)
                
                # find method-level mappings like @GetMapping("/path") or @PostMapping("/{id}")
                method_mappings = re.findall(r'@(?:Get|Post|Put|Delete|Patch)Mapping\((?:value\s*=\s*)?(?:["\'](.*?)["\'])?\)', content)
                for mapping in method_mappings:
                    path = base_path + mapping
                    # Replace Spring {var} with {param} to match frontend template literals
                    path = re.sub(r'\{.*?\}', '{param}', path)
                    backend_endpoints.append(path)

print(f"Found {len(backend_endpoints)} backend endpoints.")

# Compare them
print("\n--- Missing Endpoints (Called by frontend but not found in backend) ---")
for api in sorted(frontend_apis):
    # try to match api against backend endpoints
    # some frontend apis might have query params hardcoded e.g. /api/v1/things?page=1
    api_no_query = api.split('?')[0]
    
    # regex match since we replaced path variables with {param}
    api_regex = '^' + api_no_query.replace('{param}', '[^/]+') + '$'
    
    found = False
    for b_api in backend_endpoints:
        # Check if the structure matches ignoring specific param values
        b_parts = b_api.split('/')
        a_parts = api_no_query.split('/')
        if len(b_parts) == len(a_parts):
            match = True
            for i in range(len(b_parts)):
                if b_parts[i] != '{param}' and b_parts[i] != a_parts[i]:
                    match = False
                    break
            if match:
                found = True
                break
            
    if not found:
        print(f"FRONTEND CALLS: {api} -> NOT FOUND IN BACKEND")
