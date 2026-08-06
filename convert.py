import os
import re

source_dir = "attached_assets/efootball_market_extracted/efootball Market/src/components/"
target_dir = "artifacts/efootball-manager/src/components/marketplace/"

os.makedirs(target_dir, exist_ok=True)

for file in os.listdir(source_dir):
    if not file.endswith('.tsx'): continue
    if file == 'Navbar.tsx': continue
    
    with open(os.path.join(source_dir, file), 'r') as f:
        content = f.read()

    # 1. Replace all react-router-dom imports with wouter
    content = re.sub(
        r"import\s+\{([^}]+)\}\s+from\s+['\"]react-router-dom['\"]",
        lambda m: "import { " + m.group(1).replace("Routes", "Switch").replace("useNavigate", "useLocation as _useLocation") + " } from 'wouter'",
        content
    )
    
    # In case there's multiple imports or something:
    # We might need to manually fix useNavigate -> useLocation
    content = content.replace("useNavigate()", "_useLocation()[1]")
    content = content.replace("const navigate = _useLocation()[1];", "const [, navigate] = _useLocation();")
    
    # Replace <Routes> to <Switch>
    content = content.replace("<Routes>", "<Switch>").replace("</Routes>", "</Switch>")
    
    # In wouter <Route path="...">...</Route> instead of <Route path="..." element={<Comp/>} />
    # We will use regex to fix this:
    content = re.sub(
        r"<Route\s+path=([^>]+)\s+element=\{([^}]+)\}\s*/>",
        r"<Route path=\1>\2</Route>",
        content
    )

    # 2. Update type imports
    content = re.sub(r"from\s+['\"]\.\./types['\"]", "from '@/types/marketplace'", content)
    content = re.sub(r"from\s+['\"]\.\./\.\./types['\"]", "from '@/types/marketplace'", content)
    
    # 3. Update store imports
    content = re.sub(r"from\s+['\"]\.\./store/useStore['\"]", "from '@/store/marketStore'", content)
    
    # 4. Update utility imports
    content = re.sub(r"from\s+['\"]\.\./utils/ratingCalculator['\"]", "from '@/utils/ratingCalculator'", content)
    
    # 5. Update image paths
    content = re.sub(r"src/assets/images/[^\.]+\.jpg", "images/marketplace/pitch1.jpg", content)
    content = re.sub(r"src/assets/images/[^\.]+\.png", "images/marketplace/pitch1.jpg", content)

    # Clean up wouter imports
    content = content.replace("import { useLocation as _useLocation } from 'wouter'", "import { useLocation } from 'wouter'")
    content = content.replace("_useLocation()[1]", "useLocation()[1]")
    content = content.replace("const [, navigate] = useLocation();", "const [, navigate] = useLocation();")
    content = content.replace("const navigate = useLocation()[1];", "const [, navigate] = useLocation();")

    # If useLocation is already imported and we need navigate:
    # Actually just simple regex is fine. I'll review complex files manually if needed.

    with open(os.path.join(target_dir, file), 'w') as f:
        f.write(content)

print("Converted all components")
