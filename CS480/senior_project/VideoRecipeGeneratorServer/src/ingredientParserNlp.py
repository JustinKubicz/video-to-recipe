from ingredient_parser import parse_multiple_ingredients
import sys 

#https://pypi.org/project/ingredient-parser-nlp/
#https://stackoverflow.com/questions/23450534/how-to-call-a-python-function-from-node-js
#https://ingredient-parser.readthedocs.io/en/latest/start/index.html#optional-parameters
"""
Accuracy ratings for ingredient_parser
Sentence-level results:
	Accuracy: 95.86%

Word-level results:
	Accuracy 98.41%
	Precision (micro) 98.41%
	Recall (micro) 98.41%
	F1 score (micro) 98.41%
"""
fileId = sys.argv[2]
transcript = sys.argv[1]
sentences = transcript.split(".")



file = open("../parse-" + fileId, "a")
parse = parse_multiple_ingredients(sentences)
count = 0
for ingredient in parse:
    count = count + 1
    file.write(str(count) + ".\n"
               +"name: " + str(ingredient.name) + "\n"
               + "size: " + str(ingredient.size) + "\n"
               + "amount: " + str(ingredient.amount) + "\n"
               + "preparation: " + str(ingredient.preparation) + "\n"
               + "comment: " + str(ingredient.comment) + "\n"
               + "purpose: " + str(ingredient.purpose) + "\n"
               + "foundation_foods: " + str(ingredient.foundation_foods) + "\n"
               + "sentence: " + str(ingredient.sentence) + "\n")
    
    
    

