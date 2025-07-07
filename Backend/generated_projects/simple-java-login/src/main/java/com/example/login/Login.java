package com.example.login;

public class Login {
    private String username;
    private String password;

    public Login(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public boolean authenticate() {
        // In real application, authenticate against database or external service
        return username.equals("testuser") && password.equals("password");
    }
}