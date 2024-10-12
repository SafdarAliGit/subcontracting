// Copyright (c) 2021, Unilink Enterprise and contributors
// For license information, please see license.txt

frappe.ui.form.on('Subcontract', {
	refresh: function(frm) {
		if(frm.doc.docstatus == 1){
			if(frm.doc.total_required_qty > frm.doc.total_ordered_qty){
				frm.add_custom_button('Create Purhcase Order', function(){
					frappe.call({
						method: "get_po_items",
						doc: frm.doc,
						callback: function(r){
							console.log(r.message)
							const fields = [	
								{
									label: 'Items',
									fieldtype: 'Table',
									fieldname: 'items',
									read_only: 0,
									description: __('Material Issued'),
									fields: [
										{
											fieldtype: 'Link',
											options: 'Item',
											fieldname: 'item_code',
											read_only: 1,
											label: __('Item'),
											in_list_view: 1
										}, 
										{
											fieldtype: 'Float',
											fieldname: 'qty',
											read_only: 1,
											reqd: 0,
											label: __('Req Qty'),
											in_list_view: 1
										},
										{
											fieldtype: 'Float',
											fieldname: 'ordered_qty',
											read_only: 1,
											reqd: 0,
											label: __('Ordered Qty'),
											in_list_view: 1
										},
										{
											fieldtype: 'Float',
											fieldname: 'new_qty',
											read_only: 0,
											reqd: 0,
											label: __('Qty to be Ordered'),
											in_list_view: 1
										},
										
										{
											fieldtype: 'Data',
											fieldname: 'ref',
											read_only: 1,
											reqd: 0,
											label: __('Name'),
											in_list_view: 0
										}

									],

									//data: r.message,
									get_data: () =>{
										return r.message
									}
									
									
								}
									
							]
							var d = new frappe.ui.Dialog({
								title: __('Purchase Order Details'),
								fields: fields,
								primary_action: function(values) {
									console.log(values.items)
									for(var i in values.items){
										if( values.items[i].new_qty > values.items[i].qty - values.items[i].ordered_qty){
											msgprint("Invalid Qty")
										}
										else{
											frappe.call({method:'create_po', doc:cur_frm.doc, args:{items:values.items}, callback:function(r){cur_frm.reload_doc(); d.hide();}})
										}
									}
								},
								primary_action_label: __('Create Purchase Order')
							});
							d.show();



						}
					})
					//
				})

			}
			if(frm.doc.total_required_qty > 0){
				frm.add_custom_button('Transfer Material', function(){
					frappe.call({
						method: "get_tr_items",
						doc: frm.doc,
						callback: function(r){
							const fields = [	
								{
									label: 'Items',
									fieldtype: 'Table',
									fieldname: 'items',
									read_only: 0,
									description: __('Material Issued'),
									fields: [
										{
											fieldtype: 'Link',
											options: 'Item',
											fieldname: 'item_code',
											read_only: 1,
											label: __('Item'),
											in_list_view: 1
										}, 
										{
											fieldtype: 'Float',
											fieldname: 'qty',
											read_only: 1,
											reqd: 0,
											label: __('Req Qty'),
											in_list_view: 1
										},
										{
											fieldtype: 'Float',
											fieldname: 'supplied_qty',
											read_only: 1,
											reqd: 0,
											label: __('Supplied Qty'),
											in_list_view: 1
										},
										{
											fieldtype: 'Float',
											fieldname: 'new_qty',
											read_only: 0,
											reqd: 0,
											label: __('Qty to Transfer'),
											in_list_view: 1
										},
										
										{
											fieldtype: 'Data',
											fieldname: 'ref',
											read_only: 1,
											reqd: 0,
											label: __('Name'),
											in_list_view: 0
										}

									],

									//data: r.message,
									get_data: () =>{
										return r.message
									}
									
									
								}
									
							]
							var d = new frappe.ui.Dialog({
								title: __('Material Transfer Details'),
								fields: fields,
								primary_action: function(values) {
									for(var i in values.items){
										if( values.items[i].new_qty > values.items[i].qty - values.items[i].supplied_qty){
											msgprint("Invalid Qty")
										}
										else{
											d.hide();
											frappe.call({
												method:'transfer_material', 
												doc:cur_frm.doc, 
												args:{
													items:values.items
												}, 
												callback:function(r){
													cur_frm.refresh()
													//me.frm.reload_doc();

												}
											})
										}
									}
								},
								primary_action_label: __('Transfer Material')
							});
							d.show();



						}
					});
				});

			}
			if(frm.doc.total_required_qty > 0){

				frm.add_custom_button('Receive Material', function(){
					frappe.call({
						method: "get_rec_items",
						doc: frm.doc,
						callback: function(r){
							const fields = [	
								{
									label: 'Items',
									fieldtype: 'Table',
									fieldname: 'items',
									read_only: 0,
									description: __('Material Receipt'),
									fields: [
										{
											fieldtype: 'Link',
											options: 'Item',
											fieldname: 'item_code',
											read_only: 1,
											label: __('Item'),
											in_list_view: 1
										}, 
										{
											fieldtype: 'Float',
											fieldname: 'ordered_qty',
											read_only: 1,
											reqd: 0,
											label: __('Ordered Qty'),
											in_list_view: 1
										},
										{
											fieldtype: 'Float',
											fieldname: 'new_qty',
											read_only: 0,
											reqd: 0,
											label: __('Received Qty'),
											in_list_view: 1
										},
										
										{
											fieldtype: 'Data',
											fieldname: 'ref',
											read_only: 1,
											reqd: 0,
											label: __('Name'),
											in_list_view: 0
										}

									],

									//data: r.message,
								get_data: () =>{
									return r.message[0]
								}
									
									
							},

							{
									label: 'Raw Materials',
									fieldtype: 'Table',
									fieldname: 'materials',
									read_only: 0,
									description: __('Material Material Consumption'),
									fields: [
										{
											fieldtype: 'Link',
											options: 'Item',
											fieldname: 'for_item',
											read_only: 1,
											label: __('For Item'),
											in_list_view: 1
										}, 
										{
											fieldtype: 'Link',
											options: 'Item',
											fieldname: 'item_code',
											read_only: 1,
											label: __('Item'),
											in_list_view: 1
										}, 
										{
											fieldtype: 'Float',
											fieldname: 'consumed_qty',
											read_only: 0,
											reqd: 0,
											label: __('Consumed Qty'),
											in_list_view: 1
										},
										
										{
											fieldtype: 'Data',
											fieldname: 'ref',
											read_only: 1,
											reqd: 0,
											label: __('Name'),
											in_list_view: 0
										}

									],

									//data: r.message,
								get_data: () =>{
									return r.message[1]
								}
									
									
							}
									
						]
						var d = new frappe.ui.Dialog({
							title: __('Material Receipt Details'),
							fields: fields,
							primary_action: function(values) {
								for(var i in values.items){
									if( values.items[i].new_qty > values.items[i].qty - values.items[i].supplied_qty){
										msgprint("Invalid Qty")
									}
									else{
										d.hide();
										frappe.call({
											method:'receive_material', 
											doc:cur_frm.doc, 
											args:{
												items:values.items,
												materials:values.materials
											}, 
											callback:function(r){
												cur_frm.refresh()
												//me.frm.reload_doc();

											}
										})
									}
								}
							},
							primary_action_label: __('Transfer Material')
						});
						d.show();



					}
					});
				})
					
			}
		}
		

	}
});


frappe.ui.form.on('Subcontract Item', {
	rate(frm, cdt, cdn) {
		set_amount(frm, cdt, cdn)
	},
	qty(frm, cdt, cdn){
		set_amount(frm, cdt, cdn)
	}
});




frappe.ui.form.on('Subcontract Raw Material Supplied', {
	rate(frm, cdt, cdn) {
		set_amount(frm, cdt, cdn)
	},
	qty(frm, cdt, cdn){
		set_amount(frm, cdt, cdn)
		set_total_qty(frm, cdt, cdn)
	},
	qty_unit(frm, cdt, cdn){
		set_total_qty(frm, cdt, cdn)
	},
	for_item(frm, cdt, cdn){
		set_total_qty(frm, cdt, cdn)
	},
});



function set_amount(frm, cdt, cdn){
	var d = locals[cdt][cdn];
	frappe.model.set_value(d.doctype, d.name, 'amount', d.qty * d.rate)
}

function set_total_qty(frm, cdt, cdn){
	var d = locals[cdt][cdn];
	var item_qty = 0;
	var item = frm.doc.items;
	for(var i in item){
		if(item[i].item_code == d.for_item){
			item_qty += item[i].qty	
		}
		
	}
	frappe.model.set_value(d.doctype, d.name, 'qty', d.qty_unit * item_qty)
}

frappe.db.get_single_value('Subcontract Settings', "subcontract_services_group").then(doc => {
	cur_frm.set_query("service", "items", function(){
		return{
			filters:{
				item_group: doc
			}
		}
	})
})