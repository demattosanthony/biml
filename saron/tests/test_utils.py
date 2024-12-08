from saron.utils import extract_code_blocks


def test_extract_code_blocks():
    sample = """<Code>

```python
print("Hello, World!")
```

```bash
echo "Hello, World!"
```

</Code>"""

    assert extract_code_blocks(sample) == [
        {"language": "python", "code": 'print("Hello, World!")'},
        {"language": "bash", "code": 'echo "Hello, World!"'},
    ]
