/* Recycling sorter. General guidance; local rules always win. */
(function () {
  'use strict';
  var HG = window.HG, list = HG.$('#sorter-list');
  if (!list) return;
  var BIN = { recycle: 'Recycling', compost: 'Compost', trash: 'Trash', dropoff: 'Drop-off', hazard: 'Hazardous', reuse: 'Reuse or donate' };
  var ITEMS = [
    ['Aluminium drink can', 'recycle', 'Empty it. No need to crush unless your city asks.'],
    ['Steel food can', 'recycle', 'Rinse. Put the lid inside the can and pinch it closed.'],
    ['Aluminium foil (clean)', 'recycle', 'Scrunch into a ball bigger than a fist so sorters catch it. Greasy foil goes in the trash.'],
    ['Aluminium takeaway tray', 'recycle', 'Wipe out food first.'],
    ['Aerosol can (empty)', 'recycle', 'Only when fully empty. Partly full cans are hazardous waste.'],
    ['Glass bottle', 'recycle', 'Rinse. Some areas collect glass separately.'],
    ['Glass jar', 'recycle', 'Rinse. Metal lids go in recycling separately.'],
    ['Drinking glass or window glass', 'trash', 'Different melting point from bottles. Wrap broken pieces.'],
    ['Mirror', 'trash', 'Or donate if intact.'],
    ['Ceramic mug or plate', 'reuse', 'Donate if usable. Broken ceramics go in the trash, never with glass.'],
    ['Cardboard box', 'recycle', 'Flatten it. Remove heavy tape if you can.'],
    ['Pizza box', 'recycle', 'Clean parts recycle. Tear off greasy parts for compost or trash.'],
    ['Cereal box', 'recycle', 'Remove the plastic liner.'],
    ['Paper (office, mail)', 'recycle', 'Window envelopes are usually fine.'],
    ['Shredded paper', 'compost', 'Many recyclers reject loose shreds. Compost it, or bag it in paper if your city allows.'],
    ['Newspaper and magazines', 'recycle', ''],
    ['Paper coffee cup', 'trash', 'Most have a plastic lining. Some cities now accept them; check yours.'],
    ['Paper towel or napkin', 'compost', 'Unless it has chemicals or grease from non-food spills on it.'],
    ['Tissues', 'compost', 'Used tissues may be restricted by some programs.'],
    ['Juice or milk carton', 'recycle', 'Accepted in most US, Canadian and UK programs. Rinse and leave the cap on.'],
    ['Paper egg carton', 'compost', 'Or recycle with paper.'],
    ['Plastic water bottle (#1 PET)', 'recycle', 'Empty it and put the cap back on.'],
    ['Plastic milk jug (#2 HDPE)', 'recycle', 'Rinse.'],
    ['Shampoo and detergent bottles', 'recycle', 'Rinse. Pumps and triggers go in the trash.'],
    ['Plastic yogurt tub (#5 PP)', 'recycle', 'Accepted in most curbside programs now.'],
    ['Clamshell fruit container', 'recycle', 'Accepted in many programs, not all.'],
    ['Plastic bags and film', 'dropoff', 'Never in curbside bins: they jam sorting machines. Return to store drop-off points.'],
    ['Bubble wrap', 'dropoff', 'Treat like plastic film, or reuse it.'],
    ['Chip or crisp bag', 'trash', 'Mixed plastic and foil layers. Some brands run mail-back programs.'],
    ['Candy wrappers', 'trash', ''],
    ['Styrofoam (polystyrene) packaging', 'dropoff', 'Rarely curbside. Some depots accept clean blocks.'],
    ['Styrofoam cup', 'trash', ''],
    ['Plastic cutlery', 'trash', 'Too small to sort. Switch to reusable.'],
    ['Plastic straws', 'trash', ''],
    ['Bottle caps', 'recycle', 'Leave them screwed on to the bottle.'],
    ['Compostable plastic (PLA)', 'trash', 'Only compost if your city’s program explicitly accepts it. It contaminates plastic recycling.'],
    ['Disposable coffee pod', 'trash', 'Aluminium pods can go back to some brand programs.'],
    ['Food scraps', 'compost', 'Fruit, vegetables, grains and bread.'],
    ['Coffee grounds and filters', 'compost', ''],
    ['Tea bags', 'compost', 'Check: some contain plastic. Loose tea is always fine.'],
    ['Eggshells', 'compost', ''],
    ['Meat and fish scraps', 'compost', 'City food-waste programs usually take them. Leave out of backyard heaps.'],
    ['Dairy and cooked food', 'compost', 'City programs yes, home heaps no.'],
    ['Bones', 'compost', 'City programs only.'],
    ['Yard trimmings and leaves', 'compost', ''],
    ['Grass clippings', 'compost', 'Or leave them on the lawn.'],
    ['Houseplants and cut flowers', 'compost', ''],
    ['Pet waste', 'trash', 'Bag it. Never in compost meant for food gardens.'],
    ['Diapers', 'trash', ''],
    ['Cooking oil and grease', 'dropoff', 'Never down the drain. Many depots collect it; small amounts can be soaked up and binned.'],
    ['Wine cork (natural)', 'compost', 'Synthetic corks go in the trash.'],
    ['Batteries (AA, AAA)', 'dropoff', 'Collection bins at many shops and libraries.'],
    ['Lithium-ion batteries', 'hazard', 'Fire risk in trucks. Tape the terminals and take to a drop-off.'],
    ['Car battery', 'hazard', 'Return to the retailer or an auto shop.'],
    ['Mobile phone', 'reuse', 'Wipe it, then sell, donate or use a take-back program.'],
    ['Laptop or computer', 'dropoff', 'E-waste drop-off or manufacturer take-back. Wipe data first.'],
    ['TV or monitor', 'dropoff', 'E-waste only.'],
    ['Cables and chargers', 'dropoff', 'E-waste drop-off.'],
    ['Printer ink cartridge', 'dropoff', 'Office supply stores often take them back.'],
    ['Light bulb (LED)', 'dropoff', 'E-waste or lighting drop-off.'],
    ['Fluorescent tube or CFL', 'hazard', 'Contains mercury. Hazardous waste depot.'],
    ['Incandescent bulb', 'trash', 'Wrap it.'],
    ['Paint (latex/water-based)', 'dropoff', 'Paint take-back programs operate in many places. Dried-out latex can sometimes go in trash.'],
    ['Paint (oil-based), solvents', 'hazard', ''],
    ['Motor oil', 'hazard', 'Auto shops and depots collect used oil.'],
    ['Pesticides and garden chemicals', 'hazard', ''],
    ['Household cleaners', 'hazard', 'Use up or take partly full containers to a depot.'],
    ['Medicines', 'dropoff', 'Return to a pharmacy take-back. Never flush.'],
    ['Needles and sharps', 'hazard', 'Use a sharps container and a pharmacy or clinic drop-off.'],
    ['Propane cylinder', 'hazard', 'Exchange or depot only.'],
    ['Smoke detector', 'dropoff', 'Ionisation types hold a tiny radioactive source; return to manufacturer or depot.'],
    ['Thermometer (mercury)', 'hazard', ''],
    ['Clothing in good condition', 'reuse', 'Donate, sell or swap.'],
    ['Worn-out textiles', 'dropoff', 'Textile recycling bins accept rags and torn clothes in many cities.'],
    ['Shoes', 'reuse', 'Donate pairs tied together.'],
    ['Furniture', 'reuse', 'Sell, donate or list free locally.'],
    ['Mattress', 'dropoff', 'Many regions run mattress recycling.'],
    ['Books', 'reuse', 'Libraries, charity shops, little free libraries.'],
    ['Toys', 'reuse', 'Donate if clean and complete.'],
    ['Small appliances', 'dropoff', 'E-waste, or repair cafés for a second life.'],
    ['Large appliances', 'dropoff', 'Retailers often haul away old units on delivery.'],
    ['Scrap metal (pots, pans)', 'dropoff', 'Scrap yards and depots. Some curbside programs take pots.'],
    ['Wire hangers', 'reuse', 'Dry cleaners often take them back.'],
    ['Plastic hangers', 'reuse', 'Donate or return to shops.'],
    ['Garden hose', 'trash', 'It tangles sorting machines. Cut it up for reuse first.'],
    ['Tyres', 'dropoff', 'Tyre retailers and depots.'],
    ['Bicycle', 'reuse', 'Community bike shops refurbish them.'],
    ['Eyeglasses', 'reuse', 'Optical shops collect them for reuse.'],
    ['Toothbrush', 'trash', 'Some brands run mail-back programs.'],
    ['Toothpaste tube', 'trash', 'A few newer tubes are recyclable #2; check the label.'],
    ['Disposable razor', 'trash', ''],
    ['Cat litter', 'trash', ''],
    ['Vacuum dust and lint', 'trash', 'Natural-fibre lint can be composted in small amounts.'],
    ['Ashes (wood)', 'compost', 'Cold ashes only, in small amounts. Coal ash is trash.'],
    ['Cigarette butts', 'trash', 'Filters are plastic. Never compost.'],
    ['Wrapping paper', 'recycle', 'If it tears easily and has no foil or glitter. Otherwise trash.'],
    ['Greeting cards', 'recycle', 'Remove batteries, glitter or foil sections.'],
    ['Receipts (thermal paper)', 'trash', 'Often coated with chemicals. Choose e-receipts.'],
    ['Sticky notes', 'recycle', ''],
    ['Paper bags', 'recycle', 'Or reuse for compost collection.'],
    ['Takeaway paper container (greasy)', 'compost', 'If uncoated. Plastic-lined ones go in the trash.'],
    ['Rubber gloves', 'trash', ''],
    ['Face masks (disposable)', 'trash', 'Cut the ear loops.'],
    ['Christmas tree (real)', 'compost', 'Most cities collect them in January for mulch.']
  ];
  var input = HG.$('#sorter-q'), chips = HG.$('#sorter-bins'), bin = 'all';
  chips.innerHTML = '<button class="chip" type="button" aria-pressed="true" data-bin="all">All</button>' + Object.keys(BIN).map(function (k) { return '<button class="chip" type="button" aria-pressed="false" data-bin="' + k + '">' + BIN[k] + '</button>'; }).join('');
  function draw() {
    var q = input.value.trim().toLowerCase().replace(/(ies|es|s|y)$/, '');
    var rows = ITEMS.filter(function (it) { return (bin === 'all' || it[1] === bin) && (!q || it[0].toLowerCase().indexOf(q) > -1 || it[2].toLowerCase().indexOf(q) > -1); });
    list.innerHTML = rows.length ? rows.map(function (it) {
      return '<li><span class="si-name">' + HG.esc(it[0]) + '</span><span class="bin bin-' + it[1] + '">' + BIN[it[1]] + '</span>' + (it[2] ? '<span class="si-tip">' + HG.esc(it[2]) + '</span>' : '') + '</li>';
    }).join('') : '<li><span class="si-name">No match.</span><span class="si-tip">Try a simpler word, or check your city’s waste lookup. When in doubt, leave it out of recycling: one wrong item can spoil a whole load.</span></li>';
    HG.$('#sorter-count').textContent = rows.length + ' of ' + ITEMS.length + ' items';
  }
  input.addEventListener('input', draw);
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    bin = b.getAttribute('data-bin');
    HG.$$('.chip', chips).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
    draw();
  });
  var q = HG.params().q; if (q) input.value = q;
  draw();
})();
