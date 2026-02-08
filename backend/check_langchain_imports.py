import sys
print("Checking langchain imports...")

try:
    import langchain
    print(f"✅ langchain version: {langchain.__version__}")
except Exception as e:
    print(f"❌ langchain import error: {e}")

try:
    import langchain.agents as agents
    print(f"\n📦 Available in langchain.agents:")
    print([name for name in dir(agents) if not name.startswith('_')])
except Exception as e:
    print(f"❌ langchain.agents error: {e}")

try:
    from langchain_community.agent_toolkits import create_react_agent
    print("\n✅ create_react_agent found in langchain_community.agent_toolkits")
except Exception as e:
    print(f"❌ create_react_agent not in langchain_community.agent_toolkits: {e}")

try:
    from langchain.agents.agent import AgentExecutor
    print("✅ AgentExecutor found in langchain.agents.agent")
except Exception as e:
    print(f"❌ AgentExecutor not in langchain.agents.agent: {e}")

print("\n🔍 Searching for AgentExecutor...")
try:
    exec("from langchain_core.agents import AgentExecutor")
    print("✅ Found in langchain_core.agents")
except:
    pass

try:
    exec("from langchain.agents.executor import AgentExecutor")
    print("✅ Found in langchain.agents.executor")
except:
    pass
