local:
	rsync -e "ssh -p 2222" -rv public/ localhost:/pico-ui
.PHONY: local

deploy:
	rsync -e "ssh -p 2222" -rv public/ hey.pgs:/ui
.PHONY: deploy

fmt:
	npx @biomejs/biome check . --apply-unsafe
.PHONY: fmt

lint:
	npx @biomejs/biome ci .
.PHONY: lint

test: lint
.PHONY: test

dev:
	npm run dev
.PHONY: dev

build:
	npm run build
.PHONY: build
