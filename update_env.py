import subprocess
import os

env_vars = []
with open(".env") as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith("#"): continue
        if "=" in line and not line.startswith("FIREBASE_SERVICE_ACCOUNT_JSON"):
            env_vars.append(line)

print(f"Updating Cloud Run with {len(env_vars)} keys...")
vars_string = ",".join(env_vars)

cmd = f"gcloud run services update skillbridge-backend --region asia-south1 --update-env-vars=\"{vars_string}\""

subprocess.run(cmd, shell=True)
print("Done!")
