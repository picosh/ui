local:
	rsync -e "ssh -p 2222" -rv public/ localhost:/pico-ui
.PHONY: local

deploy:
	rsync -e "ssh -p 2222" -rv public/ pico.pgs:/ui
.PHONY: deploy

fmt:
	npx @biomejs/biome check . --apply-unsafe
.PHONY: fmt

lint:
	npx @biomejs/biome ci .
	npx tsc --noEmit
.PHONY: lint

test: lint
.PHONY: test

dev:
	npm run dev
.PHONY: dev

install:
	npm install
.PHONY: install

build:
	npm run build
.PHONY: build
