package com.example.login;

public class Main {
    public static void main(String[] args) {
        Login login = new Login("testuser", "password");
        if (login.authenticate()) {
            System.out.println("Login successful!");
        } else {
            System.out.println("Login failed.");
        }

        Signup signup = new Signup("newuser", "newpassword");
        if (signup.register()) {
            System.out.println("Signup successful!");
        } else {
            System.out.println("Signup failed.");
        }
    }
}