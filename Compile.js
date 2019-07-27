class Compile {
	constructor(el, vm) {
		this.vm = vm;
		this.$el = document.querySelector(el);
		if (this.$el) {
			this.$fragment = this.node2Fragment(this.$el);
			this.compile(this.$fragment);
			this.$el.appendChild(this.$fragment);
		}
	}
	node2Fragment(el) {
		let fragment = document.createDocumentFragment();
		let child;
		while (child = el.firstChild) {
			fragment.appendChild(child);
		}
		return fragment;
	}
	compile(fragment) {
		let childNodes = fragment.childNodes;
		Array.from(childNodes).forEach(node => {
			if (this.isElementNode(node)) {
				this.compileElementNode(node)
			} else if (this.isTextNode(node)) {
				const reg = /\{\{(.*)\}\}/;
				reg.test(node.textContent) && this.compileText(node, RegExp.$1);
			}
			node.childNodes && node.childNodes.length && this.compile(node);
		})
	}
	isElementNode(node) {
		return node.nodeType == 1;
	}
	isTextNode(node) {
		return node.nodeType == 3;
	}
	compileElementNode(node) {
		const attrs = node.attributes;
		Array.from(attrs).forEach(attr => {
			const attrName = attr.name;
			const exp = attr.value;
			if (this.isDirective(attrName)) {
				const dir = attrName.substr(2);
				this[dir] && this[dir](node, exp);
			} else if (this.isEvent(attrName)) {
				const dir = attrName.substr(1);
				this.eventHandle(node, this.vm, exp, dir);
			}
		})
	}
	isDirective(name) {
		return name.indexOf("v-") != -1;
	}
	isEvent(name) {
		return name.indexOf("@") != -1;
	}
	compileText(node, exp) {
		this.update(node, this.vm, exp, "text");
	}
	html(node, exp) {
		this.update(node, this.vm, exp, "html");
	}
	model(node, exp,vm) {
		this.update(node, this.vm, exp, "model");
		node.addEventListener('input', e => {
			this.vm[exp] = e.target.value;
		})
	}
	update(node, vm, exp, dir) {
		let updateFn = this[dir + "Updater"];
		updateFn && updateFn(node, vm[exp]);
		new Watcher(vm, exp, (val) => {
			updateFn && updateFn(node, val);
		})
	}
	textUpdater(node, text) {
		node.textContent = text;
	}
	htmlUpdater(node, html) {
		node.innerHtml = html;
	}
	modelUpdater(node, value) {
		node.value = value;
	}
	eventHandle(node, vm, exp, dir) {
		let fn = vm.$options.methods[exp] && vm.$options.methods[exp];
		fn && dir && node.addEventListener(dir, fn.bind(vm), false);
		
	}
}
