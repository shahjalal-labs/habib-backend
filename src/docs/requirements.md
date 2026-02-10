> 1. ,,po,se,r,be,c (posarbik)

> 1.1. `,,po,d,su,m(podsam)`

> 1.2. `,,se, me, t(samet)`

---

#### ex:1.1. `,,po,d,su,m(podsam)`

> ,,Products, ,,Diagnostic Test Kit, ,,Supplements, ,,Medical patch

#### ex:1.2. `,,se, me, t`

> ,,Services, ,,Med Ai-Rapid Test, ,,Telehealth

> ,,Research & development

### confusion

> Diagnostic kits, Supplements are these products? if products then it's coming based category as web has supplement page and Diagnostic kits page separately=> if this okay then again why sorting category as it create issue that is kit page will show supplement data and vice versa. ans: design has changed and no category sorting is happening now

> warehouse & country field not taking from product creation >ans: this are not using in backend

> Med Ai-Rapid Test page ( selections sort by is it from backend? ) ans: no backend exist> done by front end

> Research & Development page & it's details page (is this static page) : static done by front end

> Add to cart & Check out page (You May Also Like is this dynamic or static)

> is cart data store in backend> no handled from front end

> checkout page delivery information. is it every time coming from user manual input > it's coming from db, shipping address model

> Contact Us page flow clarification> taking details and storing (currenlty not doing anything more)

> order tracking flow clarification> is it manual tracking by admin> estimated delivery time how coming > ans: manual tracking

### code understanding from backend

## prisma model understanding

> Coupon: Coupon is also using (perhaps)

> Country > CountrySectionInfo> CountryCardInfo what't the use of these models? is it related habib project or not? ans: yes related to the project. figma Location page are based on this

> user > accessiblePages AccessiblePages[] what the use of this> is it related habib project or not? ans: yes, these are using for staff, how many page he can access control by admin

```
enum AccessiblePages {
  Dashboard
  OrderManagement
  ProductManagement
  UsersManagement
  PaymentManagement
  StaffManagement
  LocationManagement
  Settings
}
```
