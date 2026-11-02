package com.hungerhub.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

@Entity
@Table(name="bill_items")
public class BillItem {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @JsonIgnore @ManyToOne(optional=false) private Bill bill;
    @ManyToOne(optional=false) private Product product;
    @Column(nullable=false) private String productCode;
    @Column(nullable=false) private String productName;
    @Column(nullable=false) private Integer quantity;
    @Column(nullable=false, precision=10, scale=2) private BigDecimal unitPrice;
    @Column(nullable=false, precision=10, scale=2) private BigDecimal lineTotal;
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public Bill getBill(){return bill;} public void setBill(Bill v){bill=v;}
    public Product getProduct(){return product;} public void setProduct(Product v){product=v;}
    public String getProductCode(){return productCode;} public void setProductCode(String v){productCode=v;}
    public String getProductName(){return productName;} public void setProductName(String v){productName=v;}
    public Integer getQuantity(){return quantity;} public void setQuantity(Integer v){quantity=v;}
    public BigDecimal getUnitPrice(){return unitPrice;} public void setUnitPrice(BigDecimal v){unitPrice=v;}
    public BigDecimal getLineTotal(){return lineTotal;} public void setLineTotal(BigDecimal v){lineTotal=v;}
}
