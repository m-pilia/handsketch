#!/bin/awk -f

# Generate the main page, including other HTML components.
# @author Martino Pilia <martino.pilia@gmail.com>
# @date 2015-12-31

{
	print $0;
}

/<!--\s*#include\s*(.*)\s*-->/ {
	while((getline line < $3) > 0 ) {
		print line
	}
}
