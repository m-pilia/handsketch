all:
	cd html && cat main.html | awk -f "../preprocess/preprocess.awk" > ../HandSketch.html

clean:
	rm HandSketch.html
