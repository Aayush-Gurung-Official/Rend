const LoginPage = () => {
  return (
    <section>
      <h1>Login</h1>
      <form className="auth-form">
        <label>
          Email
          <input type="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" placeholder="••••••••" />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </section>
  );
};

export default LoginPage;

