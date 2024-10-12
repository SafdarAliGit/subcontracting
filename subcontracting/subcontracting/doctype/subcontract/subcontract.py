# -*- coding: utf-8 -*-
# Copyright (c) 2021, Unilink Enterprise and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Subcontract(Document):
	def before_save(self):
		self.set_totals()

	def on_cancel(self):
		for log in self.logs:
			doc = frappe.get_doc(log.reference_doctype, log.reference_name)
			doc.cancel()


	def create_po(self, items):
		po = frappe.new_doc('Purchase Order')
		po.subcontract = self.name
		po.supplier = self.supplier
		po.transaction_date = self.posting_date
		for ii in items:
			for item in self.items:
				if item.name == ii["ref"] and ii["new_qty"] > 0:
					poitem = po.append('items')
					poitem.item_code = item.service
					poitem.qty = 1
					poitem.rate = item.rate * ii["new_qty"]
					poitem.schedule_date = item.required_by
					item.ordered_qty += ii["new_qty"]
					item.balance_qty = item.qty - item.ordered_qty					
		po.save()
		po.submit()
		self.status = 'Purchase Order'
		log = self.append("logs")
		log.reference_date = frappe.utils.nowdate()
		log.reference_doctype = "Purchase Order"
		log.reference_name = po.name
		self.set_totals()
		self.save()

	def set_totals(self):
		self.total_required_qty = 0
		self.total_ordered_qty = 0
		self.total_received_qty = 0
		self.balance_qty = 0
		self.total_raw_material_qty = 0
		self.total_supplied_qty = 0
		self.total_consumed_qty = 0
		self.raw_material_balance_qty = 0

		for item in self.items:
			self.total_required_qty += item.qty
			self.total_ordered_qty += item.ordered_qty
			self.total_received_qty += item.received_qty
			self.balance_qty += item.balance_qty

		for raw in self.materials:
			self.total_raw_material_qty += raw.qty
			self.total_supplied_qty += raw.supplied_qty
			self.total_consumed_qty += raw.consumed_qty
			self.raw_material_balance_qty += raw.balance_qty




	def transfer_material(self, items):
		se = frappe.new_doc("Stock Entry")
		se.stock_entry_type = 'Material Transfer'
		se.from_warehouse = self.raw_material_warehouse
		se.to_warehouse = self.supplier_warehouse
		for ii in items:
			for item in self.materials:
				if item.name == ii["ref"] and ii["new_qty"] > 0:
					seitem = se.append('items')
					seitem.item_code = item.item_code
					seitem.s_warehouse = self.raw_material_warehouse
					seitem.t_warehouse = self.supplier_warehouse
					seitem.qty = ii["new_qty"]
					seitem.uom = item.uom
					item.supplied_qty += ii["new_qty"]
					item.balance_qty = item.supplied_qty - item.consumed_qty

		se.save()
		se.submit()
		self.status = 'Material Transferred to Supplier'
		log = self.append("logs")
		log.reference_date = frappe.utils.nowdate()
		log.reference_doctype = "Stock Entry"
		log.reference_name = se.name
		self.set_totals()
		self.save()
		self.reload()


	def receive_material(self, items, materials):
		for item in self.items:
			for ii in items:
				if item.name == ii["ref"] and ii["new_qty"] > 0:
					se = frappe.new_doc("Stock Entry")
					se.stock_entry_type = 'Manufacture'
					finrate = 0
					for mat in self.materials:
						if item.item_code == mat.for_item:
							for mm in materials:
								if mat.name == mm["ref"] and mm["consumed_qty"] > 0:
									raw = se.append("items")
									raw.s_warehouse = self.supplier_warehouse
									raw.item_code = mat.item_code
									raw.uom = mat.uom
									raw.basic_rate = mat.rate
									raw.qty = mm['consumed_qty']
									finrate += mat.rate * mm['consumed_qty']
									mat.consumed_qty += mm['consumed_qty']
					fin = se.append("items")
					fin.item_code = item.item_code
					fin.qty = ii["new_qty"]
					fin.uom = item.uom
					fin.t_warehouse = self.supplier_warehouse
					fin.basic_rate = (finrate / ii["new_qty"])+item.rate
					item.received_qty += ii["new_qty"]
					se.save()
					se.submit()
					log = self.append("logs")
					log.reference_date = frappe.utils.nowdate()
					log.reference_doctype = "Stock Entry"
					log.reference_name = se.name
		self.save()


	def get_po_items(self):
		items = []
		for i in self.items:
			if i.qty > i.ordered_qty:
				items.append(dict(
				item_code = i.item_code,
				qty = i.qty,
				new_qty = 0,
				ordered_qty = i.ordered_qty,
				ref = i.name
			))
		return items

	def get_tr_items(self):
		items = []
		for i in self.materials:
			if i.qty > i.supplied_qty:
				items.append(dict(
				item_code = i.item_code,
				qty = i.qty,
				supplied_qty = i.supplied_qty,
				new_qty = 0,
				ref = i.name
			))
		return items

	def get_rec_items(self):
		items = []
		materials = []
		for i in self.items:
			items.append(dict(
			item_code = i.item_code,
			ordered_qty = i.ordered_qty,
			received_qty = 0,
			ref = i.name
		))

		for m in self.materials:
			materials.append(dict(
			for_item = m.for_item,
			item_code = m.item_code,
			consumed_qty = 0,
			ref = m.name
		))
		return items, materials