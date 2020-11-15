export default function loadEnvVariable(envVariableName: string): string {
  const envVariableValue: string | undefined = process.env[envVariableName];
  if (envVariableValue === undefined) {
    throw new Error(`ENV does not contain ${envVariableName} variable`);
  }
  return envVariableValue;
}
