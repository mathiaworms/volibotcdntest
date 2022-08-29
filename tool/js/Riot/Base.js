(function() {
    var Base = Riot.Base = function() {};

    Base.prototype = {
        $className: 'Riot.Base',
        $class: Base,

        constructor: function() {
            return this;
        },

        callParent: function(args) {
            var me = this,
                /* BUG FIX: Gecko rendering engine doesn't seem to reparse the scope. arguments fixes this. Unknown reason.- */
                nArgs = arguments,
                method = me.callParent.caller,
                methodName, parentClass;

            if (method != null && !method.$owner) {
                if (!method.caller) {
                    //error;
                }

                method = method.caller;
            }

            methodName = method.$name;
            parentClass = method.$owner.superClass;

            if (!(methodName in parentClass)) {
                //error
            }

            return parentClass.prototype[methodName].apply(this, args || []);
        },

        addMember: function(name, value) {
            var me = this;

            if (typeof value === 'function') {
                Base.prototype.addMethod.call(me, name, value);
            } else {
                me.prototype[name] = value;
            }
        },

        addMethod: function(name, fn) {
            var me = this,
                origin;

            if (typeof fn.$owner !== 'undefined' && fn !== Riot.emptyFn) {
                origin = fn;

                fn = function() {
                    return origin.apply(me, arguments);
                };
            }

            fn.$owner = me;
            fn.$name = name;

            me.prototype[name] = fn;
        },

        addMixin: function(mix) {
            var me = this,
                key;

            if (typeof mix === 'string') {
                mix = Riot.objectQuery(mix);
            }

            for (key in mix.prototype) {
                if (mix.prototype.hasOwnProperty(key) && !me[key]) {
                    me.prototype[key] = mix.prototype[key];
                }
            }
        }
    };
}());