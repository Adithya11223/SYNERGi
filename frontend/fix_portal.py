import re

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'r') as f:
    content = f.read()

# Add import for createPortal
if "import { createPortal } from 'react-dom';" not in content:
    content = content.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport { createPortal } from 'react-dom';")

# Modify return block
return_block_start = "  return (\n    <AnimatePresence>"
new_return_block_start = """  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>"""

content = content.replace(return_block_start, new_return_block_start)

# End of return block
return_block_end = """      )}
    </AnimatePresence>
  );
};"""

new_return_block_end = """      )}
    </AnimatePresence>,
    document.body
  );
};"""

content = content.replace(return_block_end, new_return_block_end)

# Also fix the z-index to make sure it covers EVERYTHING (like sidebars and navbars)
content = content.replace('className="fixed inset-0 z-[100]', 'className="fixed inset-0 z-[99999]')

with open('/Users/adithya/Developer/SYNERGi/frontend/src/components/chat/SpeechToTextModal.tsx', 'w') as f:
    f.write(content)
print("Portal applied.")
