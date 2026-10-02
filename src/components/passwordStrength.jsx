function PasswordStrength({ password = "" }) {
  const validLength = password.length >= 8 && password.length <= 128;

  return (
    <p className={`mt-2 text-xs font-medium ${validLength ? "text-green-700" : "text-gray-500"}`}>
      {validLength ? "Password length is valid." : "Use 8 to 128 characters."}
    </p>
  );
}

export default PasswordStrength;
