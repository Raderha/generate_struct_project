package com.example.demo.user;

public class User {

    private String username;
    private String password;

    public User(String un, String password) {
        this.username = un;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    // Other methods for login and signup
    public boolean login(String username, String password) {
        return this.username.equals(username) && this.password.equals(password);
    }

    public void signup(String username, String password) {
        this.username = username;
        this.password = password;
    }
}