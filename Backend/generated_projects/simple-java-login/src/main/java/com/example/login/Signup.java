package com.example.login;

public class Signup {
    private String username;
    private String password;

    public Signup(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public boolean register() {
        // In real application, store user details in database
        return true; // Simulate successful registration
    }
}