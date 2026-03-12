# FLOW-STOCK — Stock Entry Flow (with Bonificacion)

## Full stock entry flow

```mermaid
flowchart TD
    START([User logged in - Admin or Vendedor]) --> NAV[Navigate to Entradas tab]
    NAV --> LOAD[Load products and suppliers via IPC getAll]

    LOAD --> TABLE[Stock entries history table]
    TABLE --> NEW[Click Nueva Entrada]
    NEW --> MODAL[Open StockEntryModal]

    MODAL --> PROD[Select product]
    MODAL --> QTY[Enter purchased quantity, minimum 1]
    MODAL --> BONUS[Enter bonus quantity - optional gift units from supplier]
    MODAL --> COST{Role is Admin?}
    COST -- Yes --> COSTFIELD[Enter unit cost - optional, applies to purchased qty only]
    COST -- No --> NOCOST[Cost field is hidden for Vendedor]

    COSTFIELD --> TOTALPREVIEW[Preview: total units = qty + bonus]
    NOCOST --> TOTALPREVIEW

    MODAL --> SUP[Select supplier - optional]
    MODAL --> NOTES[Enter notes - optional]

    TOTALPREVIEW --> VAL{totalQty is greater than 0?}
    VAL -- No --> ERRQTY[Show inline error]
    ERRQTY --> QTY

    VAL -- Yes --> SUBMIT[Click Registrar entrada]
    SUBMIT --> IPC[IPC: stockEntries:create]

    IPC --> SAVEENTRY[(INSERT StockEntry)]
    SAVEENTRY --> INCSTOCK[(UPDATE product.stock plus quantity plus bonus_quantity)]
    INCSTOCK --> CHECKBONUS{bonus_quantity is greater than 0?}

    CHECKBONUS -- No --> DONE[Reload entries list]
    CHECKBONUS -- Yes --> BONUSMODAL[Show BonificacionPriceModal - set sale price for bonus units]

    BONUSMODAL --> PRICEOPT{User choice}
    PRICEOPT -- Enter price --> SETPRICE[Enter precio_venta_bonificacion]
    PRICEOPT -- No price yet --> PENDING[Mark precio_bonificacion_pendiente as true]

    SETPRICE --> UPDATEPROD{Also update product price?}
    UPDATEPROD -- Yes --> IPCUPD[IPC: stockEntries:updateBonificacion with updateProductPrice true]
    IPCUPD --> UPDATEDBPROD[(UPDATE product: precio_venta_sin_iva and derived fields)]
    UPDATEDBPROD --> UPDATEENTRY[(UPDATE stock_entry: precio_venta_bonificacion)]
    UPDATEENTRY --> DONE

    UPDATEPROD -- No --> IPCUPD2[IPC: stockEntries:updateBonificacion with updateProductPrice false]
    IPCUPD2 --> UPDATEENTRY2[(UPDATE stock_entry: precio_venta_bonificacion only)]
    UPDATEENTRY2 --> DONE

    PENDING --> IPCPEND[IPC: stockEntries:updateBonificacion pending true]
    IPCPEND --> MARKENTRY[(UPDATE stock_entry: precio_bonificacion_pendiente = true)]
    MARKENTRY --> DONE[Reload entries table - pending entries show waiting badge]
```

## Alternative: set bonification price later via ProductForm

```mermaid
flowchart TD
    NAV2[Navigate to Catalogo] --> EDIT[Edit product with pending bonificacion]
    EDIT --> PFFORM[ProductForm modal opens]
    PFFORM --> BONUSSEC[Unidades Bonificadas section shows pending status]
    BONUSSEC --> SETPRICE2[Enter new precio_venta_bonificacion]
    SETPRICE2 --> IPC2[IPC: products:updateBonificacionPrice]
    IPC2 --> LOG[(INSERT BonificacionPriceLog with previous and new price)]
    LOG --> UPDPROD2[(UPDATE product: precio_venta_sin_iva and all derived fields)]
    UPDPROD2 --> HISTORY[Show last 10 price change records in the form]
```

## Stock formula

```mermaid
flowchart LR
    PREV[product.stock before entry] --> PLUS[+]
    QTY[entry.quantity] --> PLUS
    BONUS[entry.bonus_quantity] --> PLUS
    PLUS --> NEXT[product.stock after entry]
```
