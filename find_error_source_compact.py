import os

target = "AiOutl"
for root, dirs, files in os.walk("src"):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts") or file.endswith(".js") or file.endswith(".jsx"):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    if len(lines) >= 97:
                        # Check strictly line 97 (index 96)
                        if target in lines[96]:
                            print(f"FILE: {file}")
            except Exception as e:
                pass
