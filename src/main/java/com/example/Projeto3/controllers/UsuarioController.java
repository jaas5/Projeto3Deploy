package com.example.Projeto3.controllers;

import com.example.Projeto3.entities.Usuario;
import com.example.Projeto3.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios") // Define a URL base para este controller
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Autowired
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    // Endpoint para CRIAR (POST) -> /api/usuarios
    /*
    @PostMapping
    public ResponseEntity<Usuario> createUsuario(@RequestBody Usuario usuario) {
        Usuario novoUsuario = usuarioService.createUsuario(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoUsuario);
    }
    */

    // Endpoint para LER TODOS (GET) -> /api/usuarios
    @GetMapping
    public ResponseEntity<List<Usuario>> getAllUsuarios() {
        List<Usuario> usuarios = usuarioService.getAllUsuarios();
        return ResponseEntity.ok(usuarios);
    }

    // Endpoint para LER POR ID (GET) -> /api/usuarios/1
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Long id) {
        return usuarioService.getUsuarioById(id)
                .map(ResponseEntity::ok) // Se encontrou, retorna 200 OK com o usuário
                .orElse(ResponseEntity.notFound().build()); // Se não, retorna 404 Not Found
    }

    // Endpoint para ATUALIZAR (PUT) -> /api/usuarios/1
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> updateUsuario(@PathVariable Long id, @RequestBody Usuario usuarioDetails) {
        return usuarioService.updateUsuario(id, usuarioDetails)
                .map(ResponseEntity::ok) // Se atualizou, retorna 200 OK com o usuário atualizado
                .orElse(ResponseEntity.notFound().build()); // Se não, retorna 404 Not Found
    }

    // Endpoint para DELETAR (DELETE) -> /api/usuarios/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        if (usuarioService.deleteUsuario(id)) {
            return ResponseEntity.noContent().build(); // Retorna 204 No Content (sucesso, sem corpo)
        } else {
            return ResponseEntity.notFound().build(); // Retorna 404 Not Found
        }
    }

    // Endpoint para LOGIN (POST) -> /api/usuarios/login
    @PostMapping("/login")
    public ResponseEntity<Usuario> login(@RequestBody Usuario loginRequest) {
        // O frontend pode enviar username OU email no campo "username" ou "email"
        // Vamos assumir que "username" no JSON pode conter username ou email
        String login = loginRequest.getUsername() != null ? loginRequest.getUsername() : loginRequest.getEmail();
        
        return usuarioService.login(login, loginRequest.getPassword())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}