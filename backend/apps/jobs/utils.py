def validate_txt_file(file):
    if not file.name.endswith(".txt"):
        raise ValueError("Only .txt files are allowed")
