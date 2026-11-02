package com.hungerhub.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="bills", uniqueConstraints=@UniqueConstraint(columnNames="billNumber"))
public class Bill {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(unique=true) private String billNumber;
    @ManyToOne(optional=false) private Customer customer;
    @Column(nullable=false) private LocalDateTime createdAt;
    @Column(nullable=false, precision=10, scale=2) private BigDecimal subtotal;
    @Column(nullable=false) private Integer convenienceFeePercent;
    @Column(nullable=false, precision=10, scale=2) private BigDecimal convenienceFeeAmount;
    @Column(nullable=false, precision=10, scale=2) private BigDecimal grandTotal;
    @OneToMany(mappedBy="bill", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<BillItem> items = new ArrayList<>();
    public void addItem(BillItem item){items.add(item); item.setBill(this);}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getBillNumber(){return billNumber;} public void setBillNumber(String v){billNumber=v;}
    public Customer getCustomer(){return customer;} public void setCustomer(Customer v){customer=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
    public BigDecimal getSubtotal(){return subtotal;} public void setSubtotal(BigDecimal v){subtotal=v;}
    public Integer getConvenienceFeePercent(){return convenienceFeePercent;} public void setConvenienceFeePercent(Integer v){convenienceFeePercent=v;}
    public BigDecimal getConvenienceFeeAmount(){return convenienceFeeAmount;} public void setConvenienceFeeAmount(BigDecimal v){convenienceFeeAmount=v;}
    public BigDecimal getGrandTotal(){return grandTotal;} public void setGrandTotal(BigDecimal v){grandTotal=v;}
    public List<BillItem> getItems(){return items;}
}
