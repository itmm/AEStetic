ALL_HTML := $(wildcard *.html)
ALL_JS := $(wildcard *.js)
ALL_CSS := $(wildcard *.css)
SUB_HTML := $(filter-out index.html, $(ALL_HTML))
SELF := Makefile
COMMIT := $(shell git rev-parse --short HEAD)
DATE := $(shell date "+%Y-%m-%d %H:%M:%S")

index.html: $(SUB_HTML) $(ALL_JS) $(ALL_CSS) $(SELF)
	inliner -s main.html | sed -e 's/<\/script> <script>"use strict";//g' -e "s/\[LAST-COMMIT\]/$(COMMIT)/g" -e "s/\[DATE\]/$(DATE)/g" >index.html

clean:
	rm index.html

debug:
	inliner -ns main.html >index.html
