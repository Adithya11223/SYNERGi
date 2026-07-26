import os
import re
import json

def analyze_backend(base_path):
    entities = {}
    controllers = {}
    services = {}
    stomp_topics = set()
    
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if not file.endswith('.java'):
                continue
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Check for Entities
                if '@Entity' in content:
                    class_name = re.search(r'public\s+class\s+(\w+)', content)
                    fields = re.findall(r'private\s+([\w<>]+)\s+(\w+);', content)
                    if class_name:
                        entities[class_name.group(1)] = fields
                
                # Check for Controllers
                if '@RestController' in content or '@Controller' in content:
                    class_name = re.search(r'public\s+class\s+(\w+)', content)
                    mappings = re.findall(r'@(?:Get|Post|Put|Delete|Patch)Mapping\("([^"]+)"\)', content)
                    if class_name:
                        controllers[class_name.group(1)] = mappings
                        
                # Check for STOMP Topics
                if '@MessageMapping' in content or 'convertAndSend' in content or 'simpMessagingTemplate' in content:
                    topics = re.findall(r'convertAndSend\("([^"]+)"', content)
                    mappings = re.findall(r'@MessageMapping\("([^"]+)"\)', content)
                    subscribes = re.findall(r'@SubscribeMapping\("([^"]+)"\)', content)
                    stomp_topics.update(topics + mappings + subscribes)
                    
    return {'entities': entities, 'controllers': controllers, 'stomp_topics': list(stomp_topics)}

def analyze_frontend(base_path):
    zustand_stores = {}
    react_queries = []
    local_storage_usage = set()
    
    for root, dirs, files in os.walk(base_path):
        if 'node_modules' in root or 'dist' in root:
            continue
        for file in files:
            if not (file.endswith('.ts') or file.endswith('.tsx')):
                continue
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Zustand stores
                if 'create<' in content or 'create(' in content:
                    store_name = re.search(r'const\s+(\w+)\s*=\s*create', content)
                    if store_name:
                        zustand_stores[store_name.group(1)] = path.replace(base_path, '')
                        
                # React Query
                queries = re.findall(r'useQuery\(\{\s*queryKey:\s*\[([^\]]+)\]', content)
                for q in queries:
                    react_queries.append({'file': path.replace(base_path, ''), 'key': q.strip()})
                    
                mutations = re.findall(r'useMutation', content)
                if mutations:
                    react_queries.append({'file': path.replace(base_path, ''), 'type': 'mutation', 'count': len(mutations)})
                    
                # Local Storage
                if 'localStorage' in content:
                    local_storage_usage.add(f"localStorage in {file}")
                if 'sessionStorage' in content:
                    local_storage_usage.add(f"sessionStorage in {file}")
                if 'indexedDB' in content or 'idb' in content.lower():
                    local_storage_usage.add(f"IndexedDB in {file}")
                    
    return {'zustand_stores': zustand_stores, 'react_queries': react_queries, 'local_storage': list(local_storage_usage)}

if __name__ == '__main__':
    backend = analyze_backend('/Users/adithya/Developer/SYNERGi/backend/src')
    frontend = analyze_frontend('/Users/adithya/Developer/SYNERGi/frontend/src')
    print(json.dumps({'backend': backend, 'frontend': frontend}, indent=2))
