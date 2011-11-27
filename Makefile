all:
	./build.sh
	
install:
	npm install .
	
.PHONY: compress install
