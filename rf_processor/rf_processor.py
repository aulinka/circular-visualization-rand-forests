import json
import subprocess
import sys
from random_forest import RandomForest

def main():
    config = json.load(sys.stdin)
    try:
        rf = RandomForest(config)
        rf.process()
        out = rf.generate_json()
        with open(config['output_file'], 'w') as f:
            json.dump(out, f)
        print(json.dumps({
            "success": True,
            "error": None
        }))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": e
        }))


def test():
    if True:
        rf = RandomForest({
            "model": "penguins-rf.csv",
            "test_size": 0.3,
            "trees_count": 10,
            "random_state": 42,
        })
        rf.process()
        out = rf.generate_json()
        with open('data2.json', 'w') as f:
            json.dump(out, f, indent=2)
        # rf.generate_images()
    else:
        config = {
            "model": "iris",
            "test_size": 0.3,
            "trees_count": 10,
            "random_state": 42,
            "output_file": "test.json"
        }
        proc = subprocess.Popen(
            ["dist/rf_processor"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        stdout, stderr = proc.communicate(json.dumps(config))
        proc.wait()

        result = json.loads(stdout)
        print(result)

if getattr(sys, 'frozen', False):
    main()
else:
    test()