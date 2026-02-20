import os

target = "AiOutl"
for root, dirs, files in os.walk("src"):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    for i, line in enumerate(lines, 1):
                        if target in line and i == 97:
                            print(f"{path}:{i}")
            except Exception as e:
                pass
