def load_dotenv():
  env_vars = {}

  try:
    with open('.env', "r") as f:
      for line in f:
        line = line.strip()

        if not line or line.startswith("#"):
          continue

        if "=" in line:
          key, value = line.split("=", 1)
          env_vars[key.strip()] = value.strip()
  except OSError:
      print("Warning: .env file not found")

  return env_vars
