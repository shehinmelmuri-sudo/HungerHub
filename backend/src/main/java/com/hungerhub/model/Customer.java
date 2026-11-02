package com.hungerhub.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name="customers")
public class Customer {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) @NotBlank private String name;
    @Column(nullable=false) @NotBlank private String phone;
    @Column(nullable=false) @NotBlank private String roomOrBlock;
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getName(){return name;} public void setName(String name){this.name=name;}
    public String getPhone(){return phone;} public void setPhone(String phone){this.phone=phone;}
    public String getRoomOrBlock(){return roomOrBlock;} public void setRoomOrBlock(String roomOrBlock){this.roomOrBlock=roomOrBlock;}
}
