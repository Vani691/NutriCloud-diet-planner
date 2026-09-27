import os
import shutil

STORAGE_BUCKET = "../cloud_storage_bucket"

def init_storage():
    if not os.path.exists(STORAGE_BUCKET):
        os.makedirs(STORAGE_BUCKET)

def upload_file_to_bucket(filename: str, file_stream):
    filepath = os.path.join(STORAGE_BUCKET, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file_stream, buffer)
    return filepath

def get_files():
    return os.listdir(STORAGE_BUCKET)