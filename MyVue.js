class MyVue {
	constructor(options) {
		this.$options = options;
		this.$data = options.data;
		this.observe(options.data);
		this.compile = new Compile(options.el, this);
	}
	observe(obj) {
		if (obj && typeof obj == "object") {
			Object.keys(obj).forEach(key => {
				this.defineReactive(obj, key, obj[key]);
				this.proxyData(key);
			})
		}
	}
	defineReactive(obj, key, val) {
		this.observe(val);
		let dep = new Dep();
		Object.defineProperty(obj, key, {
			set(newVal) {
				if(val == newVal){
					return;
				}
				val = newVal;
				dep.notify();
			},
			get() {
				Dep.target && dep.addDep(Dep.target);
				return val;
			}
		});
	}
	proxyData(key) {
		Object.defineProperty(this, key, {
			set(value) {
				console.log(value);
				this.$data[key] = value;
			},
			get() {
				return this.$data[key];
			}
		})
	}
}
class Dep {
	constructor() {
		this.Deps = [];
	}
	addDep(dep) {
		this.Deps.push(dep);
	}
	notify() {
		this.Deps.forEach(dep => {
			dep.update();
		})
	}
}
class Watcher {
	constructor(vm, key, cb) {
		this.vm = vm;
		this.key = key;
		this.cb = cb;

		Dep.target = this;
		this.vm[this.key];
		Dep.target = null;
	}
	update() {
		this.cb.call(this.vm, this.vm[this.key]);
	}
}
