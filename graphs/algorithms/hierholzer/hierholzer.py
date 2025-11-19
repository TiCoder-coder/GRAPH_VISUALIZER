import networkx as nx

class HierholzerAlgorithm:
    def __init__(self, graph, start_node=None, mode="auto"):
        self.G = graph.copy()
        self.steps = []
        self.start_node = start_node
        self.mode = mode

    def find_start_node(self):
        odd = [v for v in self.G.nodes if self.G.degree[v] % 2 == 1]

        if self.start_node and self.start_node in self.G.nodes:
            return self.start_node

        if self.mode == "auto":
            if len(odd) == 0:
                return list(self.G.nodes)[0]
            return odd[0]

        if self.mode == "path":
            if len(odd) == 2:
                return odd[0]
            elif len(odd) == 0:
                return list(self.G.nodes)[0]
            else:
                raise Exception("Không tồn tại đường đi Euler")

        if self.mode == "circuit":
            if len(odd) == 0:
                return list(self.G.nodes)[0]
            else:
                raise Exception("Đồ thị không có chu trình Euler")

        return list(self.G.nodes)[0]

    def check_euler_type(self):
        odd = [v for v in self.G.nodes if self.G.degree[v] % 2 == 1]

        return {
            "is_eulerian_circuit": len(odd) == 0,
            "is_eulerian_path": len(odd) == 2 or len(odd) == 0
        }

    def run(self):
        G = self.G.copy()
        start = self.find_start_node()

        stack = [start]
        circuit = []

        step_id = 0
        self.steps.append({
            "step": step_id,
            "action": "start",
            "current": start,
            "stack": list(stack)
        })

        while stack:
            v = stack[-1]

            if G.degree[v] > 0:
                u = next(iter(G.neighbors(v)))
                stack.append(u)
                G.remove_edge(v, u)

                step_id += 1
                self.steps.append({
                    "step": step_id,
                    "action": "move",
                    "current": u,
                    "used_edge": [v, u],
                    "stack": list(stack)
                })

            else:
                circuit.append(v)
                stack.pop()

                step_id += 1
                self.steps.append({
                    "step": step_id,
                    "action": "backtrack",
                    "pop": v,
                    "stack": list(stack),
                    "circuit": list(circuit)
                })

        circuit.reverse()

        return {
            "path": circuit,
            "steps": self.steps
        }
