def callback(blob, metadata):
    banned = {
        "0460ef6e7f941af067dd20158695c22ba3c7aca9",
        "65f440dc170b3ad0cc80921da1a731b5dbe8dddf",
        "97211225f8e7ce3b59dce306fa755cbfa634996f"
    }
    if blob.id.hex in banned:
        blob.skip()
