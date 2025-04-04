from sklearn.datasets import load_iris, load_breast_cancer
from sklearn.model_selection import train_test_split
import sklearn.ensemble as ske
from sklearn.metrics import accuracy_score
import numpy
import matplotlib.pyplot as plt
from sklearn import tree
import pandas as pd
from sklearn.utils import Bunch

class RandomForestClassifier:
    def __init__(self, config):
        self.config = config
        self.rfc: ske.RandomForestClassifier = None
        self.accuracy = 0.0
        self.model = None
    
    def process(self):
        if self.config['model'] == "iris":
            self.model = load_iris()
        else:
            self.model = self.load_model(self.config['model'])

        x, y = self.model.data, self.model.target
        x_train, x_test, y_train, y_test = train_test_split(x, y,
                                                            test_size=self.config['test_size'],
                                                            random_state=self.config['random_state'])
        rfc = ske.RandomForestClassifier(n_estimators=self.config['trees_count'],
                                     random_state=self.config['random_state'])
        rfc.fit(x_train, y_train)
        y_predicted = rfc.predict(x_test)
        self.accuracy = accuracy_score(y_test, y_predicted)
        self.rfc = rfc

    def load_model(self, model_path):
        df = pd.read_csv(model_path, header = 0)
        feature_names = list(df.columns.values[:-1])
        data = df.iloc[:, :-1].values
        targets_names = df.iloc[:, -1].values
        target_names = list(dict.fromkeys(targets_names))
        target = [target_names.index(name) for name in targets_names]

        return Bunch(
            data=data,
            target=target,
            target_names=target_names,
            feature_names=feature_names,
        )

    def generate_json(self):
        tree_count = 0
        out = {}
        feature_names_object = {}

        if isinstance(self.model.target_names,numpy.ndarray):
            feature_names_object["target_names"] = self.model.target_names.tolist()
        else:
            feature_names_object["target_names"] = self.model.target_names
        
        if isinstance(self.model.feature_names,numpy.ndarray):
            feature_names_object["feature_names"] = self.model.feature_names.tolist()
        else:
            feature_names_object["feature_names"] = self.model.feature_names

        root_node_feature = []
        forest_max_depth = 0
        json_array = []
        for tree1 in self.rfc.estimators_:
            node_labels = numpy.empty(tree1.tree_.node_count, dtype=int)
            j = 0
            for i in range(tree1.tree_.node_count):
                if tree1.tree_.children_left[i] != -1 and tree1.tree_.children_right[i] != -1:
                    node_labels[i] = j
                    j += 1
                else:
                    node_labels[i] = -1

            if tree1.get_depth() > forest_max_depth:
                forest_max_depth = tree1.get_depth()

            tree_obj = {
                "tree_id": tree_count,
                "children_left": tree1.tree_.children_left.tolist(),
                "children_right": tree1.tree_.children_right.tolist(),
                "threshold": tree1.tree_.threshold.tolist(),
                "features": tree1.tree_.feature.tolist(),
                "label": node_labels.tolist(),
                "values": tree1.tree_.value.tolist()
            }
            # print(json.dumps(obj, indent=2))
            if tree_obj["features"][0] not in root_node_feature:
                root_node_feature.append(tree_obj["features"][0])
            json_array.append(tree_obj)
            tree_count += 1

        out["config"] = self.config
        out["accuracy"] = self.accuracy
        out["max_forest_depth"] = forest_max_depth
        out["root_node_feature"] = root_node_feature
        out.update(feature_names_object)
        out["trees"] = json_array
        return out
    def generate_images(self):
        id = 0
        for tree1 in self.rfc.estimators_:
            plt.figure(figsize=(20, 20))
            tree.plot_tree(tree1,
                        node_ids=True,
                        # proportion=True,
                        feature_names=self.model.feature_names,
                        class_names=self.model.target_names,
                        filled=True)
            plt.savefig(f"rf{id}.png")
            plt.close()
            id += 1