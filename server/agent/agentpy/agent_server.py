from flask import Flask, request, jsonify
from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from dotenv import load_dotenv
import os

# Cargar las variables desde el archivo .env
load_dotenv()

# Crear el agente
memory = MemorySaver()
model = ChatGroq(model_name="meta-llama/llama-4-scout-17b-16e-instruct")
search = TavilySearchResults(max_results=2)
tools = [search]
agent_executor = create_react_agent(model, tools, checkpointer=memory)

# Crear la aplicación Flask
app = Flask(__name__)

@app.route("/agent", methods=["POST"])
def agent():
    data = request.get_json()
    message = data.get("message")

    if not message:
        return jsonify({"error": "No message provided"}), 400

    # Llamada al agente para obtener la respuesta
    config = {"configurable": {"thread_id": "abc123"}}
    response = ""
    for step in agent_executor.stream(
            {"messages": [HumanMessage(content=message)]},
            config,
            stream_mode="values",
    ):
        response = step["messages"][-1].content

    return jsonify({"response": response})
#Comentario
if __name__ == "__main__":
    app.run(debug=True, port=5000)


