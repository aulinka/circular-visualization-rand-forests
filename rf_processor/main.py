import json

import numpy
from sklearn.datasets import load_iris, load_breast_cancer
from sklearn import tree
from random_forest import Classification
import matplotlib.pyplot as plt

iris_dataset = load_iris()
# iris_dataset = load_breast_cancer()
c = Classification(iris_dataset=iris_dataset)
rf_object = c.random_forest_calc()
# print(rf_object.random_forest, rf_object.accuracy)

iris_feature_names = iris_dataset.feature_names


def number_to_letters(n):
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    result = ""
    n += 1
    while n > 0:
        n -= 1
        result = alphabet[n % 26] + result
        n //= 26

    return result


# TREE_LEAF = -1
# TREE_UNDEFINED = -2
tree_count = 0

final_json_object = {}
feature_names_object = {
    "class_names": iris_dataset.target_names.tolist()
}

feature_names_object["feature_names"] = iris_dataset.feature_names # .tolist(),

root_node_feature = []
forest_max_depth = 0
json_array = []
for tree1 in rf_object.random_forest.estimators_:
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
        "feature": tree1.tree_.feature.tolist(),
        "label": node_labels.tolist(),
        "values": tree1.tree_.value.tolist()
    }
    # print(json.dumps(obj, indent=2))
    if tree_obj["feature"][0] not in root_node_feature:
        root_node_feature.append(tree_obj["feature"][0])
    json_array.append(tree_obj)
    tree_count += 1

final_json_object["max_forest_depth"] = forest_max_depth
final_json_object["root_node_feature"] = root_node_feature
final_json_object.update(feature_names_object)
final_json_object["trees"] = json_array
with open('data.json', 'w') as f:
    json.dump(final_json_object, f, indent=2)

if False:
    idd = 0
    for tree1 in rf_object.random_forest.estimators_:
        plt.figure(figsize=(20, 10))
        tree.plot_tree(tree1,
                    feature_names=iris_dataset.feature_names,
                    class_names=iris_dataset.target_names,
                    filled=True)
        plt.savefig(f"random_forest_tree{idd}.png")
        plt.close()
        idd += 1
