from django.shortcuts import render

from django.http import JsonResponse
import networkx as nx

def get_graph_data(request, algorithm):
    G = nx.Graph()
    G.add_edge('A', 'B', weight=2)
    G.add_edge('B', 'C', weight=3)
    G.add_edge('C', 'A', weight=1)

    nodes = [{"id": n, "group": 1} for n in G.nodes()]
    edges = [{"source": u, "target": v, "weight": G[u][v]['weight']} for u,v in G.edges()]
    steps = [
        {"visited": ["A"]},
        {"visited": ["A", "B"]},
        {"visited": ["A", "B", "C"]}
    ]

    return JsonResponse({"nodes": nodes, "links": edges, "steps": steps})