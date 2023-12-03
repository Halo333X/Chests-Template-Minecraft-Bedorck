import * as mc from "@minecraft/server";

//Player place block @Event
mc.world.afterEvents.playerPlaceBlock.subscribe(e => {
    const { block, player } = e;
    const chest = block.getTags().some(e => e.includes('halo:chest')); //Getting the block tag ("tag:halo:chest")
    const loc = block.location;
    if (chest) {
        //Spawning the container
        const chestEntity = player.dimension.spawnEntity(
            'halo:chest_entity',
            new mc.Vector(loc.x + 0.5, loc.y, loc.z + 0.5)
        );
        chestEntity.addTag('chestEntity');
    }
});

//Interact with entity @Event
mc.world.afterEvents.playerInteractWithEntity.subscribe(e => {
    const { target: entity } = e;
    if (!entity.hasTag('chestEntity')) return; //Checking if the container is a chest
    const chest = entity.dimension.getBlock(entity.location); //The chest
    if (entity.hasTag('container_open') && !entity.hasTag('chestAlreadyOpen')) {
        entity.addTag('chestAlreadyOpen');
        entity.removeTag('chestClosed');
        chest.setPermutation(chest.permutation.withState('halo:open_anim', 1)); //Adding animation if the container is open
    }
});

//Player break block @Event
mc.world.afterEvents.playerBreakBlock.subscribe(e => {
    const { block } = e;
    const entityChest = block.dimension.getEntities({ location: block.location, tags: ["chestEntity"] });
    if (block) {
        entityChest[0].kill();
    }
});

//Check if the player close the chest
mc.system.runInterval(() => {
    for (const entity of mc.world.getDimension('overworld' ? 'nether' : 'the end').getEntities({ tags: ["chestEntity"] })) {
        if (!entity.hasTag('container_open') && !entity.hasTag('chestClosed')) {
            entity.removeTag('chestAlreadyOpen');
            entity.addTag('chestClosed');
            const chest = entity.dimension.getBlock(entity.location);
            chest.setPermutation(chest.permutation.withState('halo:open_anim', 7)); //If it's not open, close animation
        }
    }
});

mc.system.beforeEvents.watchdogTerminate.subscribe(e => e.cancel = true);