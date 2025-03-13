from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score


class CalculatedRandomForest:
    def __init__(self, random_forest, accuracy):
        self.random_forest = random_forest
        self.accuracy = accuracy


class Classification:

    def __init__(self, iris_dataset):
        self.dataset = iris_dataset

    def random_forest_calc(self):
        x, y = self.dataset.data, self.dataset.target
        x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.3, random_state=42)
        random_forest = RandomForestClassifier(n_estimators=500, random_state=42)
        random_forest.fit(x_train, y_train)
        y_predicted = random_forest.predict(x_test)

        random_forest_obj = CalculatedRandomForest(random_forest=random_forest,
                                                   accuracy=accuracy_score(y_test, y_predicted))
        return random_forest_obj
