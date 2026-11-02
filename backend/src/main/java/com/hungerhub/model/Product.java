package com.hungerhub.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Entity
@Table(name="products", uniqueConstraints=@UniqueConstraint(columnNames="code"))
public class Product {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, length=4, unique=true) @Pattern(regexp="\\d{4}", message="Product code must be exactly four digits")
    private String code;
    @Column(nullable=false) @NotBlank private String name;
    @Column(nullable=false, precision=10, scale=2) @DecimalMin("0.01") private BigDecimal price;
    @Column(nullable=false) @Min(0) private Integer stock;
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getCode(){return code;} public void setCode(String code){this.code=code;}
    public String getName(){return name;} public void setName(String name){this.name=name;}
    public BigDecimal getPrice(){return price;} public void setPrice(BigDecimal price){this.price=price;}
    public Integer getStock(){return stock;} public void setStock(Integer stock){this.stock=stock;}
}
