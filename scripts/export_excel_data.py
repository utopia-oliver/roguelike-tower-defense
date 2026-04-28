import json
import math
import re
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
WORKBOOK_DIR = ROOT.parent
OUT_FILE = ROOT / "data" / "game-data.js"

NS = {
    "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


def col_index(cell_ref):
    match = re.match(r"([A-Z]+)", cell_ref)
    total = 0
    for char in match.group(1):
        total = total * 26 + ord(char) - 64
    return total - 1


def coerce(value):
    if not isinstance(value, str):
        return value
    value = value.strip()
    if value == "":
        return ""
    if value in ("TRUE", "True", "是"):
        return True
    if value in ("FALSE", "False", "否"):
        return False
    try:
        number = float(value)
    except ValueError:
        return value
    return int(number) if number.is_integer() else number


def first_number(value, default=0):
    match = re.search(r"\d+(?:\.\d+)?", str(value))
    return float(match.group(0)) if match else default


def parse_percent(value, default=0):
    match = re.search(r"(\d+(?:\.\d+)?)%", str(value))
    if match:
        return float(match.group(1)) / 100
    return default


def read_workbook(path):
    with zipfile.ZipFile(path) as archive:
        shared_strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in root.findall("a:si", NS):
                shared_strings.append(
                    "".join(
                        node.text or ""
                        for node in item.iter(
                            "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t"
                        )
                    )
                )

        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        rel_targets = {
            rel.attrib["Id"]: rel.attrib["Target"].lstrip("/") for rel in rels
        }

        sheets = []
        for sheet in workbook.find("a:sheets", NS):
            rel_id = sheet.attrib[
                "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
            ]
            sheets.append((sheet.attrib["name"], rel_targets[rel_id]))

        def cell_value(cell):
            value_node = cell.find("a:v", NS)
            if value_node is None:
                inline = cell.find("a:is", NS)
                if inline is None:
                    return ""
                return "".join(
                    node.text or ""
                    for node in inline.iter(
                        "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t"
                    )
                )
            raw = value_node.text or ""
            cell_type = cell.attrib.get("t")
            if cell_type == "s":
                return shared_strings[int(raw)]
            if cell_type == "b":
                return raw == "1"
            return raw

        all_rows = {}
        for name, target in sheets:
            root = ET.fromstring(archive.read(target))
            rows = []
            for row in root.findall(".//a:sheetData/a:row", NS):
                values = {}
                for cell in row.findall("a:c", NS):
                    values[col_index(cell.attrib["r"])] = cell_value(cell)
                if values:
                    rows.append([values.get(i, "") for i in range(max(values) + 1)])
            all_rows[name] = rows
        return all_rows


def table_from_header(rows, first_header):
    header_index = next(
        index for index, row in enumerate(rows) if row and row[0] == first_header
    )
    headers = rows[header_index]
    records = []
    for row in rows[header_index + 1 :]:
        if not row or row[0] == "":
            continue
        if row[0] in ("wave", "enemy_id", "perk_id", "role_id", "formation_id"):
            break
        records.append(
            {
                headers[i]: coerce(row[i] if i < len(row) else "")
                for i in range(len(headers))
                if headers[i] != ""
            }
        )
    return records


def normalize_formation(row):
    return {
        "id": row["formation_id"],
        "name": row["阵法名"],
        "rarity": row["品阶"],
        "triggerRadius": first_number(row["触发范围"], 2.5),
        "cooldown": first_number(row["冷却"], 6),
        "effectText": row["被动效果"],
        "maxTargets": 6 if row["formation_id"] == "formation_qinglian" else 99,
        "effectType": (
            "knockback_slow"
            if "玄武" in row["阵法名"]
            else "chain_lightning"
            if "雷" in row["阵法名"]
            else "burning_area"
            if "离火" in row["阵法名"]
            else "freeze"
            if "寒月" in row["阵法名"]
            else "aoe_damage"
        ),
    }


def normalize_role(row):
    trajectory = "single"
    note = row["固定攻击弹道"]
    if "溅射" in note or "爆裂" in note or "范围" in note:
        trajectory = "splash"
    if "穿" in note:
        trajectory = "pierce"
    if "减速" in note or row["攻击流派"] == "冰":
        trajectory = "slow"
    if "毒" in note or row["攻击流派"] == "毒":
        trajectory = "poison"
    if "弹射" in note or row["攻击流派"] == "雷":
        trajectory = "chain"
    if "扇形" in note or "横向" in note or "相邻列" in note:
        trajectory = "horizontal"
    attack_interval = first_number(row["攻击间隔"], 1)
    passive = "" if row["天赋/被动"] == "无" else row["天赋/被动"]
    return {
        "id": row["role_id"],
        "name": row["角色名"],
        "rank": row["宗门位阶"],
        "rarity": row["稀有度"],
        "unlock": row["解锁方式"],
        "unlockCondition": row["解锁方式"],
        "school": row["攻击流派"],
        "projectileText": note,
        "projectile": trajectory,
        "projectileType": trajectory,
        "trajectoryType": trajectory,
        "baseDamage": first_number(row["基础伤害"]),
        "attackInterval": attack_interval,
        "baseAttackSpeed": round(1 / attack_interval, 4),
        "range": first_number(row["射程"], 3),
        "baseRange": first_number(row["射程"], 3),
        "talent": row["天赋/被动"],
        "passiveSkill": passive,
        "level": 1,
        "upgradeCost": 50,
        "note": row["MVP实现备注"],
    }


def normalize_artifact(row):
    return {
        "id": row["artifact_id"],
        "name": row["法宝名"],
        "rarity": row["稀有度"],
        "damage": first_number(row["基础伤害"]),
        "cooldown": first_number(row["冷却"], 6),
        "attackText": row["攻击方式"],
        "targeting": row["目标规则"],
    }


def normalize_perk(row):
    text = str(row["数值/参数"])
    effect = {"type": "unimplemented", "value": 0}
    pid = row["perk_id"]
    if pid in ("perk_damage_minor", "perk_damage_major"):
        effect = {"type": "role_damage_mult", "value": parse_percent(text)}
    elif pid == "perk_attack_speed":
        effect = {"type": "role_attack_speed", "value": parse_percent(text)}
    elif pid == "perk_range":
        effect = {"type": "role_range_add", "value": first_number(text, 0.5)}
    elif pid == "perk_crit":
        effect = {"type": "crit", "chance": 0.1, "mult": 1.8}
    elif pid == "perk_pierce_one":
        effect = {"type": "pierce_add", "value": 1}
    elif pid in ("perk_side_projectile", "perk_parallel_sword_left_right", "perk_all_projectiles"):
        effect = {"type": "side_projectiles", "value": 1}
    elif pid == "perk_multishot":
        effect = {"type": "multishot", "value": 1}
    elif pid == "perk_formation_damage":
        effect = {"type": "formation_damage_mult", "value": parse_percent(text)}
    elif pid == "perk_formation_cooldown":
        effect = {"type": "formation_cooldown_mult", "value": 0.8}
    elif pid == "perk_formation_radius":
        effect = {"type": "formation_radius_add", "value": 0.5}
    elif pid == "perk_base_hp":
        effect = {"type": "array_hp_bonus", "value": 30}
    elif pid == "perk_lingqi_gain":
        effect = {"type": "lingqi_gain_mult", "value": parse_percent(text)}
    elif pid == "perk_boss_slayer":
        effect = {"type": "boss_damage_mult", "value": parse_percent(text)}
    elif pid == "perk_slow_damage":
        effect = {"type": "slow_vulnerability", "value": parse_percent(text)}
    return {
        "id": row["perk_id"],
        "name": row["机缘名"],
        "category": row["类别"],
        "rarity": row["稀有度"],
        "target": row["目标"],
        "description": row["效果描述"],
        "valueText": row["数值/参数"],
        "requirement": row["前置条件"],
        "stackable": row["可叠加"],
        "note": row["Codex实现要点"],
        "effect": effect,
    }


def normalize_enemy(row):
    enemy_type = row["类型"]
    is_boss = enemy_type == "Boss"
    move_speed = first_number(row["速度"])
    attack_damage = first_number(row["到达阵眼伤害"])
    attack_interval = 2.5 if is_boss else 2.0 if enemy_type == "坦克" else 1.8 if enemy_type == "精英" else 1.2 if enemy_type == "快速" else 1.5
    spirit_qi_reward = first_number(row["灵气奖励"])
    return {
        "id": row["enemy_id"],
        "name": row["敌人名"],
        "type": enemy_type,
        "hp": first_number(row["生命"]),
        "maxHp": first_number(row["生命"]),
        "speed": move_speed,
        "moveSpeed": move_speed,
        "baseDamage": attack_damage,
        "attackDamage": attack_damage,
        "attackInterval": attack_interval,
        "spiritQiReward": spirit_qi_reward,
        "lingqiReward": spirit_qi_reward,
        "trait": row["特性"],
        "note": row["备注"],
        "isBoss": is_boss,
    }


def build_wave_segments(row, name_to_id):
    wave = int(row["wave"])
    text = row["敌人配置"]
    segments = []

    def add(name, count, delay=0, interval=0.85):
        segments.append(
            {
                "wave": wave,
                "enemyId": name_to_id[name],
                "count": int(count),
                "startDelay": delay,
                "spawnInterval": interval,
            }
        )

    if "混合怪约30" in text:
        add("山野小妖", 14, 0, 0.45)
        add("疾行妖狼", 8, 2, 0.55)
        add("玄甲巨兽", 6, 4, 1.2)
        add("血煞邪修", 2, 6, 1.8)
    elif "大量混合怪约45" in text:
        add("山野小妖", 20, 0, 0.35)
        add("疾行妖狼", 12, 2, 0.45)
        add("玄甲巨兽", 8, 4, 1.0)
        add("血煞邪修", 5, 7, 1.5)
    elif "持续刷新" in text:
        add("域外魔影", 1, 0, 1)
        add("山野小妖", 18, 3, 0.35)
        add("疾行妖狼", 10, 5, 0.45)
        add("玄甲巨兽", 5, 7, 1.1)
        add("血煞邪修", 3, 9, 1.6)
    else:
        parts = re.split(r"[，,]", text)
        for index, part in enumerate(parts):
            match = re.match(r"(.+?)×(\d+)", part.strip())
            if match:
                add(match.group(1), int(match.group(2)), index * 2, max(0.45, 1 - wave * 0.03))
    return {
        "wave": wave,
        "segments": segments,
        "goal": row["设计目的"],
        "lingqiScale": first_number(row["基础灵气规模"]),
        "isBossWave": row["是否Boss波"] == "是",
        "settlementLingstone": first_number(row["局外结算灵石参考"]),
    }


def main():
    matches = list(WORKBOOK_DIR.glob("*新版角色肉鸽塔防*Codex*.xlsx"))
    if not matches:
        raise SystemExit("Could not find 新版角色肉鸽塔防 Codex workbook")
    workbook_path = matches[0]
    sheets = read_workbook(workbook_path)

    formations = [normalize_formation(row) for row in table_from_header(sheets["03_阵法"], "formation_id")]
    roles = [normalize_role(row) for row in table_from_header(sheets["04_宗门角色"], "role_id")]
    artifacts = [normalize_artifact(row) for row in table_from_header(sheets["05_法宝"], "artifact_id")]
    levels = table_from_header(sheets["06_局内等级"], "局内等级")
    perks = [normalize_perk(row) for row in table_from_header(sheets["07_机缘池"], "perk_id")]
    enemies = [normalize_enemy(row) for row in table_from_header(sheets["08_敌人与波次"], "enemy_id")]

    enemy_name_to_id = {enemy["name"]: enemy["id"] for enemy in enemies}
    wave_rows = table_from_header(sheets["08_敌人与波次"], "wave")
    waves = [build_wave_segments(row, enemy_name_to_id) for row in wave_rows]

    player_meta = table_from_header(sheets["02_局外玩家"], "字段ID")
    initial_roles = [
        role["id"]
        for role in roles
        if "初始拥有" in role["unlock"] or role["id"] in ("role_ye_shuangning", "role_cheng_mozhu")
    ]

    data = {
        "sourceWorkbook": workbook_path.name,
        "config": {
            "columns": 5,
            "rows": 6,
            "deployRows": [5],
            "maxWaves": 15,
            "baseHp": 180,
            "arrayCore": {
                "maxHp": 180,
                "currentHp": 180,
                "defense": 2,
                "damageReductionRate": 0,
            },
            "rosterSlots": 3,
        },
        "playerMeta": player_meta,
        "initial": {
            "formation": "formation_qinglian",
            "roles": initial_roles,
            "artifact": "artifact_qingming_swordcase",
        },
        "formations": {item["id"]: item for item in formations},
        "roles": {item["id"]: item for item in roles},
        "artifacts": {item["id"]: item for item in artifacts},
        "levels": [
            {
                "level": int(row["局内等级"]),
                "requiredLingqi": first_number(row["累计所需灵气"]),
                "increment": first_number(row["本级增量"]),
            }
            for row in levels
        ],
        "perks": perks,
        "enemies": {item["id"]: item for item in enemies},
        "waves": waves,
        "settlement": {
            "basePerWave": 10,
            "killFactor": 0.5,
            "bossBonus": {"5": 50, "10": 80, "15": 150},
            "victoryBonus": 200,
        },
    }

    OUT_FILE.parent.mkdir(exist_ok=True)
    OUT_FILE.write_text(
        "window.GAME_DATA = "
        + json.dumps(data, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(f"Exported {workbook_path} -> {OUT_FILE}")


if __name__ == "__main__":
    main()
