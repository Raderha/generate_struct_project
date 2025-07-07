package com.example.demo.user;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void login() {
        User user = new User("testuser", "password");
        assertTrue(user.login("testuser", "password"));
        assertFalse(user.login("wronguser", "password"));
        assertFalse(user.login("testuser", "wrongpassword"));
    }

    @Test
    void signup() {
        User user = new User(null, null);
        user.signup("newuser", "newpassword");
        assertEquals("newuser", user.getUsername());
        assertEquals("newpassword", user.getPassword());
    }
}