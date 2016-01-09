ALL_HTML := $(wildcard *.html)
ALL_JS := $(wildcard *.js)
ALL_CSS := $(wildcard *.css)
SUB_HTML := $(filter-out index.html, $(ALL_HTML))
SELF := Makefile

index.html: $(SUB_HTML) $(ALL_JS) $(ALL_CSS) $(SELF)
	inliner -s main.html >index.html

clean:
	rm index.html

debug:
	inliner -ns main.html >index.html
