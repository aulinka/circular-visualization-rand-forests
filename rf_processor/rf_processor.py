import json
import subprocess
import sys
import numpy as np
from random_forest_classifier import RandomForestClassifier
from random_forest_regressor import RandomForestRegressor

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)

def main():
    config = json.load(sys.stdin)
    try:
        rf = None
        if config['type'] == "classification":
            rf = RandomForestClassifier(config)
        elif config['type'] == "regression":
            rf = RandomForestRegressor(config)
        rf.process()
        out = rf.generate_json()
        with open(config['output_file'], 'w') as f:
            json.dump(out, f, cls=NpEncoder)
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
        rf = RandomForestClassifier({
            "type": "classification",
            "model": "iris",
            "name": "test",
            "test_size": 0.3,
            "trees_count": 10,
            "random_state": 42,
        })
        rf.process()
        out = rf.generate_json()
        with open('data.json', 'w') as f:
            json.dump(out, f, indent=2, cls=NpEncoder)
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

# If app is compiled to .exe, run main, else test
if getattr(sys, 'frozen', False):
    main()
else:
    test()