package com.example.Projeto3.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.List;


@Entity
@Getter
@Setter
@NoArgsConstructor
public class Usuario{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long idUser;

    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(unique = true)
    private String email;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Feedback> feedbacks;

}
