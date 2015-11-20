if (Meteor.isClient) {

    Pensieve = {}

    p = Pensieve;
    p.nodes = [];
    p.selected = null;

    p.init = function() {
        recognition = new webkitSpeechRecognition();
        recognition.onresult = function(event) {
            console.log(event);

            if (event.results.length > 0) {
                alert(event.results[0][0].transcript);
            }
        }

        recordButton = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2, 20, {
            isStatic: true,
            render: {
                fillStyle: "transparent",
                lineWidth: 0,
                sprite: {
                    xScale: 0.4,
                    yScale: 0.4,
                    texture: "/core.png"
                }
            }
        });

        recordButton.label = "core"


        deleteButton = Bodies.circle(window.innerWidth - 50, window.innerHeight - 50, 35, {
            render: {
                fillStyle: "transparent",
                strokeStyle: "#C03546",
                lineWidth: 3
            },
            isStatic: true,
            label: "delete"
        });

        // button1 = Bodies.

    }

    p.toggleMenu = function(node) {
        if (node.actionsShown) {
            p.hideActions(node)
        } else {
            p.showActions(node)
        }

        node.actionsShown = !node.actionsShown
    }

    p.toggleChildren = function(node) {
        if (node.folded) {
            p.children(node, true)
        } else {
            p.children(node, false)
        }

        node.folded = !node.folded
    }

    p.hideActions = function(node) {
        var edges = _.filter(_engine.world.constraints, function(edge) {
            return edge.label == "action" && edge.bodyA && edge.bodyA.id == node.id
        });

        var childNodes = _.map(edges, function(edge) {
            return edge.bodyB
        });

        _.each(childNodes, function(node) {
            World.remove(_engine.world, node)
        });

        _.each(edges, function(edge) {
            World.remove(_engine.world, edge)
        });

    }

    p.children = function(node, visible) {
        var edges = _.filter(_engine.world.constraints, function(edge) {
            return edge.label != "action" && edge.bodyA && edge.bodyA.id == node.id
        });

        var childNodes = _.map(edges, function(edge) {
            return edge.bodyB
        });

        //Recursion
        _.each(childNodes, function(childNode) {
            p.children(childNode, visible)
        });

        _.each(childNodes, function(childNode) {
            childNode.render.visible = visible
        });

        _.each(edges, function(edge) {
            edge.render.visible = visible
        });
    }

    p.select = function(body) {
        if (p.selected) {
            p.selected.render.lineWidth = 1
            p.selected.circleRadius = 15
        }

        p.selected = body
        p.selected.render.lineWidth = 4
        p.selected.circleRadius = 20

        Session.set("selected", "")
    }

    p.delete = function() {
        if (p.selected) {
            World.remove(_engine.world, p.selected, true);
        }
    }

    p.fix = function(body, data) {
        body.isStatic = !body.isStatic
    }

    p.showActions = function(node) {
        // node
        var action1 = Bodies.polygon(node.position.x + 15, node.position.y - 10, 6, 15, {
            label: 'Find Similar',
            render: {
                fillStyle: '#BD2346'
            }
        });

        var action2 = Bodies.polygon(node.position.x + 25, node.position.y, 6, 15, {
            label: 'Related News',
            render: {
                fillStyle: '#BD2346'
            }
        });

        var action3 = Bodies.polygon(node.position.x + 15, node.position.y + 10, 6, 15, {
            label: 'Show Statistics',
            render: {
                fillStyle: '#BD2346'
            }
        });

        var edge1 = Constraint.create({
            bodyA: node,
            bodyB: action1,
            length: 50,
            label: "action",
            stiffness: 1,
            angularStiffness: 1,
            render: {
                visible: false
            }
        });

        var edge2 = Constraint.create({
            bodyA: node,
            bodyB: action2,
            length: 50,
            label: "action",
            stiffness: 1,
            angularStiffness: 1,
            render: {
                visible: false
            }
        });

        var edge3 = Constraint.create({
            bodyA: node,
            bodyB: action3,
            length: 50,
            label: "action",
            stiffness: 1,
            angularStiffness: 1,
            render: {
                visible: false
            }
        });

        World.add(_engine.world, [action1, action2, action3])
        World.add(_engine.world, [edge1, edge2, edge3])
    }

    p.parentEdge = function(body) {
        return _.findWhere(_engine.world.constraints, {
            bodyB: body,
            label: 'edge'
        });
    }

    p.newNode = function(text, data) {
        var color = p.selected ? p.selected.render.fillStyle : null;
        var target = {}

        var core = p.selected || _.findWhere(_engine.world.bodies, {
            label: 'core'
        });

        if (p.selected && p.parentEdge(p.selected)) {
            var parentEdge = p.parentEdge(p.selected)
            var shoot = Vector.normalise(Vector.sub(parentEdge.bodyA.position, parentEdge.bodyB.position))
            target.x = p.selected.position.x - shoot.x * 5
            target.y = p.selected.position.y - shoot.y * 5
        } else {
            target.x = window.innerWidth / 2;
            target.y = window.innerHeight / 2;

            var level1 = _.filter(_engine.world.constraints, function(edge, key, list){
                return edge.bodyA && edge.bodyA == core;
            });

            var v = {x: 0, y: -100}
            
            if (level1.length == 0) {
                v = Vector.rotate(v, 0)
            } else if (level1.length == 1) {
                v = Vector.rotate(v, Math.PI/3)
            } else if (level1.length == 2) {
                v = Vector.rotate(v, Math.PI/3 * 2)
            } else if (level1.length == 3) {
                v = Vector.rotate(v, Math.PI)
            } else if (level1.length == 4) {
                v = Vector.rotate(v, -Math.PI/3 * 2)
            } else if (level1.length == 5) {
                v = Vector.rotate(v, -Math.PI/3)
            }

            target = Vector.add(target, v);
        }

        var node = Bodies.circle(target.x, target.y, 20, {
            render: {
                fillStyle: color
            }
        });

        node.label = text || "Brilliant idea";
        node.data = data;

        var edge = Constraint.create({
            bodyA: core,
            bodyB: node,
            length: 150,
            label: "edge",
            stiffness: 0.005,
            render: {
                strokeStyle: color || "#FFF",
                lineWidth: 1
            }
        });

        World.add(_engine.world, [edge, node])
    }

    function resize(width, height) {
        _engine.world.bounds.max = {
            x: width,
            y: height
        };
        _engine.render.canvas.width = width;
        _engine.render.canvas.height = height;
        _engine.render.canvas.style.width = width + 'px';
        _engine.render.canvas.style.height = height + 'px';
    }

    p.init();

    Template.canvas.helpers({
        selected: function() {
            Session.get("selected")
            return p.selected;
        }
    });

    Template.canvas.rendered = function() {
        var container = document.getElementById('canvas');
        container.width = window.innerWidth;
        container.height = window.innerHeight;

        // some example engine options
        window.mousePos = {}
        $(window).bind('mousemove', function(e) {
            window.mousePos.x = e.pageX;
            window.mousePos.y = e.pageY;
        })

        var options = {
            enableSleeping: false,
            render: {
                options: {
                    background: "#00C4C0",
                    showIds: true,
                    wireframes: false
                }
            }
        };

        // create a Matter engine
        // NOTE: this is actually Matter.Engine.create(), see the aliases at top of this file
        _engine = Engine.create(container, options);
        resize(window.innerWidth, window.innerHeight);


        // add a mouse controlled constraint
        _mouseConstraint = MouseConstraint.create(_engine);
        // _mouseConstraint.constraint.render.lineWidth = 0;


        //Walls
        // World.add(_engine.world, [
        //     Bodies.rectangle(3, 3, 2, window.innerHeight * 2, {
        //         isStatic: true
        //     }),
        //     Bodies.rectangle(3, 3, window.innerWidth * 2, 2, {
        //         isStatic: true
        //     }),
        //     Bodies.rectangle(10, window.innerHeight - 5, window.innerWidth * 2, 2, {
        //         isStatic: true
        //     }),
        //     Bodies.rectangle(window.innerWidth - 5, 10, 2, window.innerHeight * 2, {
        //         isStatic: true
        //     })
        // ]);

        World.add(_engine.world, [_mouseConstraint, recordButton, deleteButton]);
        _engine.world.gravity.y = 0;

        Events.on(_engine, 'mousemove', function(event) {
            if (_mouseConstraint.constraint.bodyB) {
                var body = _mouseConstraint.constraint.bodyB;
                var con = _.findWhere(_engine.world.constraints, {
                    'bodyB': body,
                    'label': 'edge'
                });

                if (con.bodyA && con.bodyB) {
                    con.length = Vector.magnitude(Vector.sub(con.bodyA.position, con.bodyB.position));
                }
            }
        });

        Events.on(_engine, 'mousedown', function(event) {
            var mouse = event.mouse;

            if (_mouseConstraint.constraint.bodyB) {
                var body = _mouseConstraint.constraint.bodyB;
                var con = _.findWhere(_engine.world.constraints, {
                    'bodyB': body,
                    'label': 'edge'
                });

                if (con && con.bodyA && con.bodyB) {
                    con.length = Vector.magnitude(Vector.sub(con.bodyA.position, con.bodyB.position));
                }
            }

            if (p.selected) {
                if (Bounds.contains(p.selected.bounds, mouse.position) && Vertices.contains(p.selected.vertices, mouse.position)) {
                    //recognition.start();
                }
            }
        });


        Events.on(_engine, 'mouseup', function(event) {
            var mouse = event.mouse;

            if (p.selected) {
                if (Bounds.contains(p.selected.bounds, mouse.position) && Vertices.contains(p.selected.vertices, mouse.position)) {
                    // recognition.stop();
                    return
                }
            }

            if (Bounds.contains(recordButton.bounds, mouse.position) && Vertices.contains(recordButton.vertices, mouse.position)) {

                p.newNode("Something", {
                    title: "Elon Musk",
                    description: "Works at SpaceX & Tesla Lived in Los Angeles",
                    embed: "<iframe style='width:100%' src='http://prismatic.github.io/explorer/?topics=2142&aspect=type.article.content.other&page=1'></iframe>"
                });

                return
            }

            if (Bounds.contains(deleteButton.bounds, mouse.position) && Vertices.contains(deleteButton.vertices, mouse.position)) {
                console.log("Delete")
                p.delete();
                return
            }

            _.each(_engine.world.bodies, function(body) {
                if (body.id == recordButton.id) return;

                if (Bounds.contains(body.bounds, mouse.position) && Vertices.contains(body.vertices, mouse.position)) {

                    if (p.selected == body) {
                        p.toggleChildren(body)
                    } else {
                        p.select(body)
                    }
                }
            });
        });

        // run the engine
        Engine.run(_engine);
        Demo.initControls();
    };
}

if (Meteor.isServer) {
    Meteor.startup(function() {
        // code to run on server at startup
    });
}
