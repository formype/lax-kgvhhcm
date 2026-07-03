import sys
from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.in_body = False

    def handle_data(self, data):
        text = data.strip()
        if text:
            self.text.append(text)

file_path = sys.argv[1]
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

parser = MyHTMLParser()
parser.feed(content)

full_text = " ".join(parser.text)
import re
# Print roughly where the bio starts
start = full_text.find("Chủ tịch Hồ Chí Minh (tên lúc nhỏ là Nguyễn Sinh Cung")
if start != -1:
    print(full_text[start:start+3000])
else:
    print("Could not find the start.")
