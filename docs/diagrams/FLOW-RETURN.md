# FLOW-RETURN — Return / Devolution Flow

## Full return flow

```mermaid
flowchart TD
    START([User logged in]) --> NAV[Navigate to Historial tab]
    NAV --> LOAD[Load sales + returns via IPC getAll]

    LOAD --> TABLE[Sales table with status badges]
    TABLE --> FIND[Find target sale]

    FIND --> ELIGIBLE{Sale status?}
    ELIGIBLE -- Completada --> CANRETURN
    ELIGIBLE -- Parcial --> CANRETURN
    ELIGIBLE -- Pendiente / Devuelta / Cancelada --> BLOCKED[↩ Devolver button hidden\nor disabled]

    CANRETURN[Click ↩ Devolver] --> MODAL[Open ReturnModal]

    MODAL --> ITEMS[Show sale items list\nwith original quantities]
    ITEMS --> ALREADY[Compute alreadyReturned\nfrom existing returns for this sale_id]
    ALREADY --> AVAIL[Show available qty = original − already_returned\nItems fully returned shown greyed / disabled]

    AVAIL --> SELECT[User selects items + quantities to return]
    SELECT --> REASON[Select reason\nProducto defectuoso / Error en venta /\nCliente arrepentido / Otro]
    REASON --> NOTES[Optional notes]
    NOTES --> CONFIRM[Click Confirmar Devolución]

    CONFIRM --> IPC[IPC: returns:create\nsale_id · items · reason · notes]

    IPC --> SVAL{Load all prior returns\nfor this sale_id}
    SVAL --> QVAL{Each requested qty\n≤ original − already_returned?}
    QVAL -- No --> ERRQTY[throw 'Cantidad excede lo disponible']
    ERRQTY --> MODAL

    QVAL -- Yes --> TX[(DB Transaction)]
    TX --> SAVERETURN[(INSERT Return\ntotal_refunded · is_partial · reason)]
    SAVERETURN --> SAVEDETAILS[(INSERT ReturnDetail × N\nproduct_name · unit_price · subtotal snapshots)]
    SAVEDETAILS --> RESTORESTOCK[(UPDATE product.stock\n+= qty for each returned item)]
    RESTORESTOCK --> UPDSTATUS[(UPDATE Sale.status)]

    UPDSTATUS --> CHECKFULL{All original items\nfully returned?}
    CHECKFULL -- Yes --> SETDEV[status = 'Devuelta'\nis_partial = false]
    CHECKFULL -- No --> SETPAR[status = 'Parcial'\nis_partial = true]

    SETDEV --> COMMIT[Commit transaction]
    SETPAR --> COMMIT
    COMMIT --> REFRESH[Reload sales + returns\nUpdate UI]
```

## Sale status state machine (return-related)

```mermaid
stateDiagram-v2
    [*] --> Completada : sales:create (default)
    [*] --> Pendiente : sales:create (operator selection)

    Completada --> Parcial : returns:create (partial)
    Completada --> Devuelta : returns:create (total)
    Parcial --> Devuelta : returns:create (remaining items)

    Pendiente --> Completada : sales:updateStatus
    Pendiente --> Cancelada : sales:updateStatus

    note right of Devuelta : Cannot be returned again
    note right of Cancelada : No return possible
```
